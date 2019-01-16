# anu study

## 运行流程

### **1 React组件实例**
> 首字母大写的标签被识别为 React 组件，babel 将它转化为 React.createElement

#### 1.1 createElement 方法：
> 参数：   
type - 组件的构造函数(Component)   
config - 传入的需要创建的组件实例的自定义属性，config 里面有 props 这些   
...children - 第三个参数是一个 ES6 的 reset 参数，标识后面的参数不限个数      
返回值：eactElement - 一个 React 组件实例

#### 1.2 ReactElement 构造方法(type, tag, props, key, ref, owner)
> 参数   
type：构造函数  
tag：5-默认值，2-React 组件的构造函数，1-普通函数   
props:自定义属性,   
key,   
ref,   
Renderer.currentOwner   
返回值：
返回一个对象{
  type,
  tag,
  props,
  owner
}

####  1.3 Fiber 对象 
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
vnode:上一步中创建的 React 组件虚拟 Dom 对象  
container：需要放置页面的容器 DOM 对象   
callback: 渲染完成回调函数   

```javascript
function render(vnode, root, callback) {
  //生成外部容器, 这里的container其实就是一个Fiber对象实例
  let container = createContainer(root)
   // 是否立刻进行更新的标识，默认表示不立即进行更新
  let immediateUpdate = false
  // 不是根节点的话，需要清空节点中的内容然后作为根节点
  if(!container.hostRoot) {
    // 清空root
    emptyElement(root)
    // 如果是新的根节点，则立即进行更新组件
    immediateUpdate = true
  }
  
  // 更新组件,这里的updateComponent是一个重要的方法，很多性能优化的点都在这个里面做的
  updateComponent(container.hostRoot, {
      child: vnode
  }, wrapCb(callback, carrier), immediateUpdate);
  return carrier.instance;
}
```
#### 2.1.1 updateComponent 方法

> 参数：   
instance:虚拟根组件，即顶级的根组件   
state：组件内部传递的参数   
callback: 更新完成回调函数   
immediateUpdate：是否立即更新   
```javascript
function updateComponent(instance, state, callback, immediateUpdate){

}
```

// // 遍历子元素，children(子元素)，parentFiber(父容器)，updateQueue(更新时事件队列)
// mountChildren(children, parentFiber, updateQueue, mountCarrier) {
//     for (var i in children) {
//       // 遍历 children的Vnode => mountVnode
//       mountVnode(children[i], parentFiber, updateQueue, mountCarrier)
//     }
// }

// mountVnode(vnode, parentFiber, updateQueue, mountCarrier){
//   // 判断vnode的tag tag > 4的话为HostFiber(根组件)
//   let useHostFiber = vnode.tag > 4;
//   let fiberCtor = useHostFiber ? HostFiber : ComponentFiber;
//   // 新建一个fiberCtor的对象
//   var fiber = new fiberCtor(vnode, parentFiber);

//   fiber.init(updateQueue, mountCarrier)
// }

// // 初始化fiber
// fiber.init: function init(updateQueue, mountCarrier)
//   if(tag === 1) {

//   } else {

//   }
//   // 执行组件的componentWillMount生命周期函数
//   captureError(instance, "componentWillMount", []);
//   // 合并获取新的state
//   instance.state = this.mergeStates();
//   // 执行渲染方法，返回他的子组件对象
//   this.render(updateQueue);
// }


// render(updateQueue){
//   // 执行组件的render方法，返回react元素对象
//   let rendered = captureError(instance, "render", [])
//   // 返回的react元素对象转化为数字，这里用void 666标识undefined，因为
//   // 某些特殊的环境下，undefined会被重新赋值，不如void 666保险，这里
//   // void 是个操作符，他会将后面的表达式执行了，然后返回undefined
//   // 所以void后面无论些什么表达式都可以，反正返回undefined
//   let number = typeNumber(rendered)
//   // 如果rendered是对象，那么number > 2,这里继续细化x虚拟dom,设置父组件的子组件
//   fiberizeChildren(rendered, this)
//   // 進行比對子元素
//   Refs.diffChildren(fibers, children, this, updateQueue, this._mountCarrier);
// }

// fiberizeChildren(rendered, this){
//   // 操作子元素
//   operateChildren(c, "", flattenCb, isIterable(c), true);
// }

// diffChildren(fibers, children, this, updateQueue, this._mountCarrier) {
//   if(isEmpty){
//     // 继续挂载子元素
//     mountChildren()
//   }
// }

// mountChildren(){
//   mountVnode

// }
```
