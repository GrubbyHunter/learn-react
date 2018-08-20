# anu study

## 运行流程

### 1 首字母大写的标签被识别为 React 组件，babel 将它转化为 React.createElement

1.1 createElement 方法：设置属性 props，标签类型 tag，以及组件的类型(即 React 的 class)，生成一个 Vnode 类型对象
// Refs: 全局变量，存放虚拟 DOM 的引用
Vnode 主要有以下几个属性{
type：Component 的构造函数
tag：类型
props：属性
}

### 2 进行 renderByAnu 渲染方法

2.1 renderByAnu 参数：vnode(上一步中创建的 Vnode 构造函数对象), container(需要放置页面的容器 DOM 对象), callback(渲染完成回调函数)
topNodes:全局数组变量

```javascript
renderByAnu(vnode, root, callback) {
  //生成外部容器
  let wrapperVnode = createElement ("AnuInternalFiber", ) => new Vnode()
  let rootIndex = topNodes.indexOf(root)
  let wrapperFiber
  if(rootIndex !== -1) {

  } else {
    // 清空root
    emptyElement(root)
    topNodes.push(root)
    // 用root创建一个vnode => 用vnode创建HostFiber对象;
    let rootFiber = new HostFiber(root)
    rootFiber.stateNode = root
    rootFiber.children = wrapperVnode

    // x进入mountChildren, children(虚拟子节点)，rootFiber(虚拟根节点)
    mountChildren(children, rootFiber, updateQueue, mountCarrier)

    wrapperFiber = rootFiber.child;
    // 执行队列中的方法
    drainQueue(updateQueue);
  }

  topFibers[rootIndex] = wrapperFiber
  root.__component = wrapperFiber

  drainQueue(updateQueue)
  return wrapperFiber.child ? wrapperFiber.child.stateNode : null
}

// 遍历子元素，children(子元素)，parentFiber(父容器)，updateQueue(更新时事件队列)
mountChildren(children, parentFiber, updateQueue, mountCarrier) {
    for (var i in children) {
      // 遍历 children的Vnode => mountVnode
      mountVnode(children[i], parentFiber, updateQueue, mountCarrier)
    }
}

mountVnode(vnode, parentFiber, updateQueue, mountCarrier){
  // 判断vnode的tag tag > 4的话为HostFiber(根组件)
  let useHostFiber = vnode.tag > 4;
  let fiberCtor = useHostFiber ? HostFiber : ComponentFiber;
  // 新建一个fiberCtor的对象
  var fiber = new fiberCtor(vnode, parentFiber);

  fiber.init(updateQueue, mountCarrier)
}

// 初始化fiber
fiber.init: function init(updateQueue, mountCarrier)
  if(tag === 1) {

  } else {

  }
  // 执行组件的componentWillMount生命周期函数
  captureError(instance, "componentWillMount", []);
  // 合并获取新的state
  instance.state = this.mergeStates();
  // 执行渲染方法，返回他的子组件对象
  this.render(updateQueue);
}


render(updateQueue){
  // 执行组件的render方法，返回react元素对象
  let rendered = captureError(instance, "render", [])
  // 返回的react元素对象转化为数字，这里用void 666标识undefined，因为
  // 某些特殊的环境下，undefined会被重新赋值，不如void 666保险，这里
  // void 是个操作符，他会将后面的表达式执行了，然后返回undefined
  // 所以void后面无论些什么表达式都可以，反正返回undefined
  let number = typeNumber(rendered)
  // 如果rendered是对象，那么number > 2,这里继续细化x虚拟dom,设置父组件的子组件
  fiberizeChildren(rendered, this)
  // 進行比對子元素
  Refs.diffChildren(fibers, children, this, updateQueue, this._mountCarrier);
}

fiberizeChildren(rendered, this){
  // 操作子元素
  operateChildren(c, "", flattenCb, isIterable(c), true);
}

diffChildren(fibers, children, this, updateQueue, this._mountCarrier) {
  if(isEmpty){
    // 继续挂载子元素
    mountChildren()
  }
}

mountChildren(){
  mountVnode

}
```
