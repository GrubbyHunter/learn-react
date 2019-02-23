# anu study

## 运行流程

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

### **2 进行 render 渲染方法**

const topNodes // 数组，存放上层节点
const topFibers // 数组，存放上层容器

#### 2.1 render 方法

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

  // 更新组件,这里的updateComponent是一个重要的方法，很多性能优化的点都在这个里面做的
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

#### 2.1.1 updateComponent 方法

> updateComponent 方法为组件的 setState/forceUpdate 的具体实现。  
> 参数：  
> instance:虚拟根组件，即顶级的根组件  
> state：组件内部传递的参数  
> callback: 更新完成回调函数  
> immediateUpdate：是否立即更新

```javascript
function updateComponent(instance, state, callback, immediateUpdate) {
  // updateComponent 中进行一系列合并updateState的事件队列操作
  // 判断immediateUpdate为true时候才进行真正的更新
  // 即performWork(deadline)方法
  Renderer.scheduleWork();
}
// deadline的默认值
let deadline = {
  didTimeout: false,
  timeRemaining() {
    return 2;
  }
};
Renderer.scheduleWork = function() {
  performWork(deadline);
};
```

#### 2.1.2 performWork 方法

> 参数：
> deadline:

```javascript
function performWork(deadline) {
  workLoop(deadline);

  if (macrotasks.length) {
    // 通过递归调用自身
    requestIdleCallback(performWork);
  }
}
```

#### 2.1.3 workLoop 方法

> 参数：
> deadline:

```javascript
function workLoop(deadline) {
  // 取排在最前面的宏任务，每个fiber代表一棵虚拟DOM树
  var fiber = macrotasks.shift();
  // 收集任务
  reconcileDFS(fiber, info, deadline, ENOUGH_TIME);

  // 宏任务队列没空的话继续循环手机宏队列任务
  if (macrotasks.length && deadline.timeRemaining() > ENOUGH_TIME) {
    workLoop(deadline);
  } else {
    // 空了的话进行commit 执行任务
    commitDFS(effects);
  }
}
```

#### 2.1.4 reconcileDFS 方法

> 参数：
> deadline:

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

      // 遍历完子节点之后，如果存在后继节点，则往下遍历后继节点
      fiber = fiber.sibling;
      if (fiber) {
        continue;
      }
    }
  } catch (e) {
    occurError = true;
    pushError(fiber, fiber.errorHook, e);
  }
}
```

#### 2.1.5 commitDFS 方法

> 参数：
> effects:

```javascript
function commitDFS(effects) {
  // 真正的批量更新
  Renderer.batchedUpdates(() => {
    commitDFSImpl;
  });
}
```

#### 2.1.6 commitDFSImpl 方法

> 参数：
> effects:

```javascript
function commitDFSImpl(effects) {
  // 这个里面通过eventTag事件机制使用DFS深度优先遍历去批量执行
  // "insertElement", "updateContent", "updateAttribute"
  // 优先轮询处理Fiber的子节点
  whille(fiber){
    Renderer[domFns[i]](fiber);
    if(fiber.child){
      fiber = fiber.child
      continue
    }

    // 然后遍历Fiber的兄弟节点
    whille(fiber){
      commitEffects(fiber)

      if(fiber.sibling){
        fiber = fiber.sibling
        continue
      }
    }
  }

}
```

#### 2.1.7 commitEffects 方法

> 参数：
> Fiber:

```javascript
function commitEffects(fiber) {
  // 执行生命周期函数componentDidUpdate、componentDidMount
}
```

#### 2.1.8 updateClassComponent 方法，用于更新组件,产生具体的组件实例

> 参数：
> deadline:

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

#### 2.1.9 updateHostComponent 方法，用于更新 DOM，产生具体的 DOM 节点，一般 React 组件遍历到最末端都是使用此方法产出 dom 节点

> 参数：
> deadline:

```javascript
function updateHostComponent(fiber, info) {
  // 递归到虚拟dom树的最底层，返回的是dom对象，则调用此方法更新dom
  // 修改fiber的effectTag属性值，每增加一个执行方法，就乘以该方法对应的值然后赋值给effectTag
    // 这里收集后续fiber需要执行的任务，使用质数相乘来记录任务
  // 生成React Component记录的任务有
  | RLACE   | 插入或移动 | 3
  | CONTENT | 修改文本   | 5
  | ATTR    | 修改属性   | 7

  // 拿去diff
  diffChildren(fiber, rendered);
}
```

#### 2.1.10 diffChildren 方法，比对子节点

> 参数：
> deadline:

```javascript
function diffChildren(parentFiber, rendered) {
  // tree diff 树比较

  // 首先打平children 赋值给parent，这样parentFiber的children就有值了
  var newFibers = fiberizeChildren(children, parentFiber);

  // 然后通过将
  /**
   * component diff 组件比较
   * 1、同类型的组件，同class
   * 2、不同类型的组件
   * 3、 shouldComponentUpdate
   */
  /**
   * element diff 节点比较
   * 1、INSERT_MARKUP 插入节点
   * 2、MOVE_EXISTING 移动节点
   * 3、REMOVE_NODE 删除节点
   */
}
```
