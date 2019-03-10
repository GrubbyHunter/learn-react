# anu.js study

> 本项目是关于类似 react 的开源框架 anu.js 的学习，特别是 anujs 针对 react v16 版本的改进地方会有比较详细的说明，如有不对的地方欢迎指正

## 运行流程

yarn install  
npm run dev

## 流程图

![avatar](/show.jpg)

## 常用方法和实例介绍

### **1 React 组件实例**

> 首字母大写的标签被识别为 React 组件，babel 将它转化为 React.createElement

#### 1.1 createElement 方法：

> 参数：  
> type - 组件的构造函数(Component)  
> config - 传入的需要创建的组件实例的自定义属性，config 里面有 props 这些  
> ...children - 第三个参数是一个 ES6 的 reset 参数，标识后面的参数不限个数  
> 返回值：eactElement - 一个 React 组件实例

#### 1.2 ReactElement 构造方法(type, tag, props, key, ref, owner)

> 参数  
> type：构造函数  
> tag：5-默认值，2-React 组件的构造函数，1-普通函数  
> props:自定义属性,  
> key,  
> ref,  
> Renderer.currentOwner  
> 返回值：
> 返回一个对象{
> type,
> tag,
> props,
> owner
> }

#### 1.3 Fiber 对象

```javascript
{
  type: vnode.type || "ProxyComponent(react-hot-loader)" // 类型
  name:"",//名称,
  stateNode:{}, //对应的真实 dom
  effectTag::1, //效果标签,
  containerStack:[], //数组，存放上层容器的栈
  contextStack:[], //数组，存放向下文栈
  microtasks:[], //数组
  return:Fiber//返回容器节点
}
```

#### 1.4 render 方法

> 参数：  
> vnode:上一步中创建的 React 组件虚拟 Dom 对象  
> container：需要放置页面的容器 DOM 对象  
> callback: 渲染完成回调函数

```javascript
function render(vnode, root, callback) {
  //生成外部容器, 这里的container其实就是一个Fiber对象实例
  let container = createContainer(root);
  // 是否立刻进行更新的标识，默认表示不立即进行更新
  let immediateUpdate = false;
  // 不是根节点的话，需要清空节点中的内容然后作为根节点
  if (!container.hostRoot) {
    // 清空root
    emptyElement(root);
    // 如果是新的根节点，则立即进行更新组件
    immediateUpdate = true;
  }

  updateComponent(
    container.hostRoot,
    {
      child: vnode
    },
    wrapCb(callback, carrier),
    immediateUpdate
  );
  return carrier.instance;
}
```

## 具体的实现流程

### 1 updateComponent

> 无论是初始化时候 ReactDOM.reader 方法，还是组件内部的 setState 方法，最终的组件挂载，生成真正的 dom 元素，实现都是在 updateComponent 方法里面  
> 这里我们简化来看 pushChildQueue 实际上只是把需要处理的 fiber 对象放入队列中，mergeUpdates 也仅仅是合并 state 的操作，真正的更新是在 scheduleWork 方法中进行，所以只有 immediateUpdate 为 true 时候才会进行更新  
> 分情况看，组件初次挂载到节点上(ReactDOM.reader 方)，这时候是会进行直接更新的，但是像 onclick 的回调函数里面触发的 setState，就不会立即进行更新的，而是在最终时间执行完后合并 state 最终进行更新

```javascript
function updateComponent(instance, state, callback, immediateUpdate) {
  pushChildQueue(fiber, microtasks);

  mergeUpdates(fiber, state, isForced, callback);

  if (immediateUpdate) {
    Renderer.scheduleWork();
  }
}

Renderer.scheduleWork = function() {
  performWork(deadline);
};
```

### 2 performWork

> 这个方法也仅仅是递归调用自己

```javascript
function performWork(deadline) {
  workLoop(deadline);

  if (macrotasks.length) {
    // 通过递归调用自身
    requestIdleCallback(performWork);
  }
}
```

### 3 workLoop

> workLoop 里面实际是也是递归调用自己，从上一步收集的队列里面拿出需要处理的 Fiber 进行处理  
> reconcileDFS 实际上就用来收集 Fiber 的事件的，anujs 简化了 react 的事件系统，通过质数相乘的方式，让每个 Fiber 的 effectTag 属性能记住这个 fiber 有哪些事件需要处理(比如 insert、update、delete)  
> commitDFS 里面则是执行真正的对 dom 元素的操作，通过上一步的记录，知道 fiber 有哪些事件，并执行对应的事件进行处理  
> 这里要强调一点事，react v16 以后的 fiber 不再是树结构，而是链表结构(这个后续会说明)，所以这个 workLoop 递归如果在一帧时间不够的情况下会中断 fiber 的时间收集(reconcileDFS)，然后去执行 dom 操作(commitDFS)，因为是链表结构所以下一次进来仍能从上一次的 fiber 继续递归收集任务  
> reconcileDFS 阶段实际上是十分耗时的，这样打断递归，同时使用 requestIdleCallback 定时器重新进来收集事件的操作，这是一种非常有效的优化手段。这样的话将之前递归积累的堆栈直接给释放了，浏览器针对这种定时器也会进行优化，从而使代码执行更快。  
> 就好比游泳运动员一直头沉到水下游泳，如果头是不是抬到水面上呼吸进行调整的话，自然也能游得更快^\_^

```javascript
function workLoop(deadline) {
  // 取排在最前面的宏任务，每个fiber代表一棵虚拟DOM树
  var fiber = macrotasks.shift();
  // 收集任务
  reconcileDFS(fiber, info, deadline, ENOUGH_TIME);
  // 把最外层的fiber放入effects中作为需要update的对象
  updateCommitQueue(fiber);
  // 宏任务队列没空的话继续循环手机宏队列任务
  if (macrotasks.length && deadline.timeRemaining() > ENOUGH_TIME) {
    workLoop(deadline);
  } else {
    // 空了的话进行commit 执行任务
    commitDFS(effects);
  }
}
```

### 4 reconcileDFS

> 这个方法主要是通过 DFS 遍历一颗 dom 树，同时它里面会针对是 React 组件实例还是 dom 节点分别进行处理

```javascript
function reconcileDFS(fiber, info, deadline, ENOUGH_TIME) {
  try {
    // 为了性能起见，constructor, render, cWM,cWRP, cWU, gDSFP, render
    // getChildContext都可能 throw Exception，因此不逐一try catch
    // 通过fiber.errorHook得知出错的方法
    while (fiber) {
      // 这个遍历花的时间较长，所以这里如果超过了一帧的时间则进行打断，然后从此处重新进行遍历
      if (fiber.disposed || deadline.timeRemaining() <= ENOUGH_TIME) {
        break;
      }

      if (fiber.tag < 3) {
        updateClassComponent(fiber, info); // 生成react组件实例
      } else {
        updateHostComponent(fiber, info); // 生成DOM节点实例
      }

      // 遍历玩当前层级节点之后如果存在子节点，则继续遍历子节点
      fiber = fiber.child;
      if (fiber) {
        continue;
      }
      while (fiber) {
        // 遍历完子节点之后，如果存在后继节点，则往下遍历后继节点
        fiber = fiber.sibling;
        if (fiber) {
          continue;
        }

        // 这里遍历完最终还是回到最外层的fiber
        fiber = fiber.return;
      }
    }
  } catch (e) {
    occurError = true;
    pushError(fiber, fiber.errorHook, e);
  }
}
```

### 5 updateClassComponent

> 用于处理具体的组件 Fiber 实例，同时调用组件 reader 之前的各个生命周期函数，同时收集需要处理的 React 组件对应的事件

```javascript
function updateClassComponent(fiber, info) {
  // 执行Fiber对象的生命周期钩子函数
  if (fiber.hasMounted) {
    // componentWillReceiveProps、shouldComponentUpdate、componentWillUpdate
    applybeforeUpdateHooks(fiber, instance, props, newContext, contextStack);
  } else {
    // componentWillMount
    applybeforeMountHooks(fiber, instance, props, newContext, contextStack);
  }
  // 这里收集后续fiber需要执行的任务，使用质数相乘来记录任务
  // 生成React Component记录的任务有
  | HOOK     | 生命周期回调 | 11
  | REF      | 设置引用     | 13
  | DETACH   | 移出DOM树    | 17
  | CALLBACK | 方法回调     | 19
  | CAPTURE  | 错误处理     | 23


  // 调用render方法获取fiber的子元素
  var rendered = applyCallback(instance, "render", []);
  // 拿去diff
  diffChildren(fiber, rendered);
}
```

### 6 updateHostComponent

> 用于处理 DOM 节点实例，一般 React 组件遍历到最末端都是使用此方法产出 dom 节点，使用 forwardFiber 记录 dom 节点对应的前一个元素，使用 insertPoint 记录父节点中最后一个节点的位置，这里会收集节点上需要处理的事件

```javascript
function updateHostComponent(fiber, info) {
  // forwardFiber记录dom节点对应的前一个元素
  fiber.forwardFiber = parent.insertPoint;
  // insertPoint记录父节点中最后一个节点的位置
  parent.insertPoint = fiber;
  fiber.effectTag = PLACE;
  // 拿去diff
  diffChildren(fiber, rendered);
}
```

### 7 diffChildren

> 比对新旧 dom 树上的节点，同一级的 React 组件，如果类型不同直接删除，同时在此方法中会将 Fiber 设置 child、parent 和 sibling 三个属性，这样树结构就变成了一个链表结构

```javascript
function diffChildren(parentFiber, rendered) {
  // 首先打平children 赋值给parent，这样parentFiber的children就有值了
  var newFibers = fiberizeChildren(children, parentFiber);
  // 首先遍历旧的fiber
  for (var i in oldFibers) {
    var newFiber = newFibers[i];
    var oldFiber = oldFibers[i];
    // 如果新的子fiber和旧的fiber类型一致，则旧的fiber的key以新的为准
    if (newFiber && newFiber.type === oldFiber.type) {
      matchFibers[i] = oldFiber;
      if (newFiber.key != null) {
        oldFiber.key = newFiber.key;
      }
      continue;
    }
    // 数组中节点元素不存在，直接删除
    // 如果新的子fiber元素没有，但是旧的子fiber有，则将旧的fiber增加DETACH事件
    // 并将旧的子fiber放置parent fiber的effects属性里面 也就是(effects$$1)，用于后续的删除
    detachFiber(oldFiber, effects$$1);
  }

  // 遍历新的fiber
  for (var _i in newFibers) {
    var _newFiber = newFibers[_i];
    var _oldFiber = matchFibers[_i];
    var alternate = null;
    if (_oldFiber) {
      // isSameNode需要type和key都相同才会成立，注意，这里如果两个key都是null也是成立的
      if (isSameNode(_oldFiber, _newFiber)) {
        alternate = new Fiber(_oldFiber);
        var oldRef = _oldFiber.ref;
        _newFiber = extend(_oldFiber, _newFiber);
      } else {
        // 直接删除
        detachFiber(_oldFiber, effects$$1);
      }
    } else {
      /**
       * component diff 组件比较
       * 不同类型的组件，直接移除
       */
      _newFiber = new Fiber(_newFiber);
    }
    newFibers[_i] = _newFiber;
    _newFiber.index = index++;
    _newFiber.return = parentFiber;
    if (prevFiber) {
      // 记录他的兄弟节点
      prevFiber.sibling = _newFiber;
      _newFiber.forward = prevFiber;
    } else {
      // 记录它的子节点
      parentFiber.child = _newFiber;
      _newFiber.forward = null;
    }
    prevFiber = _newFiber;
  }
}
```

### 8 commitDFS

> dom 节点的操作

```javascript
function commitDFS(effects) {
  // 真正的批量更新
  Renderer.batchedUpdates(() => {
    // 遍历需要处理的Fiber
    while ((el = effects$$1.shift())) {
      // 如果是需要删除当前Fiber，则直接进行删除
      if (el.effectTag === DETACH && el.caughtError) {
        disposeFiber(el);
      } else {
        commitDFSImpl(el);
      }
      // 最终收集完需要删除的dom统一进行删除
      if (domRemoved.length) {
        domRemoved.forEach(Renderer.removeElement);
        domRemoved.length = 0;
      }
    }
  });
}
```

### 9 commitDFSImpl 方

> 实现对组件实例和真实节点的操作

```javascript
function commitDFSImpl(effects) {

  // 优先轮询处理Fiber的子节点
  whille(fiber){
      // 当前fiber的effects属性里面有值，则先用disposeFiber处理effects
      // effects里面有eventTag被标记为删除的2元素，则在disposeFiber中会放入domRemoved中用于后续的删除
      if (fiber.effects && fiber.effects.length) {
          fiber.effects.forEach(disposeFiber);
          delete fiber.effects;
      }

      // 存在插入或者移动操作则进行对应操作
      if (fiber.effectTag % PLACE == 0) {
        domEffects.forEach(function (effect, i) {
            // 依次执行插入节点，修改节点文本，修改节点属性
            if (fiber.effectTag % effect == 0) {
                // "insertElement", "updateContent", "updateAttribute"
                Renderer[domFns[i]](fiber);
                fiber.effectTag /= effect;
            }
        });
        fiber.hasMounted = true;
      }

      // 处理完当前节点后如果有子节点先处理子节点
      if(fiber.child){
        fiber = fiber.child
        continue
      }

      // 然后遍历Fiber的兄弟节点
      whille(fiber){
        commitEffects(fiber)
        // 如果有后继节点，则处理后继节点
        if(fiber.sibling){
          fiber = fiber.sibling
          continue
        }
      }
  }

}
```

### 10 insertElement

> 这里特别要说一下插入操作,updateHostComponent 中记录了各个节点的前一个节点，以及各个节点的父节点的最后一个节点用来插入时候作比较。

```javascript
function insertElement(fiber) {
  var dom = fiber.stateNode,
    parent = fiber.parent;
  try {
    var insertPoint = fiber.forwardFiber ? fiber.forwardFiber.stateNode : null;
    var after = insertPoint ? insertPoint.nextSibling : parent.firstChild;
    // 如果当前节点的前一个节点的后一个节点不是当前节点，则当前节点需要移动到后一个节点之前，所以这里特别要注意，往前移动可能要移动多次，但是往后移动只需要移动一次
    if (after == dom) {
      return;
    }
    if (after === null && dom === parent.lastChild) {
      return;
    }
    Renderer.inserting = fiber.tag === 5 && document.activeElement;
    parent.insertBefore(dom, after);
    Renderer.inserting = null;
  } catch (e) {
    throw e;
  }
}
```

### 11 setState

> setState 实际上调用的是 updateComponent 方法  
> 多次 setState 的话，在 updateComponent 方法中，会将多个 state 的值存入 queue 队列中，然后 queue 赋值给 macroTask  
> click 触发 setState 时候，首先会进行上述 updateComponent 中的操作，然后最后调用 Renderer.scheduleWork()，因为 updateComponent 方法存放了需要进行更新的 Fiber，所有 Renderer.scheduleWork()之行时候里面的 macroTask 中只有需要更新的 Fiber，只对这部分 Fiber 进行更新操作  
> setTimeout 定时器 触发 setState 时候，首先会进行上述 updateComponent 中的操作，这里的全局变量直接为 true，直接将 Fiber 放入 microtasks 中，因为不走 react 的事务机制，则直接调用 Renderer.scheduleWork()进行更新，这里的 State 不会进行合并，render 会执行多次
