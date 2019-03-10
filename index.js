let React = require("React");
let ReactDOM = require("ReactDOM");

class ComponentContainer extends React.Component {
  componentWillMount() {
    this.setState({
      list: [
        { name: "a", age: 18 },
        { name: "b", age: 19 },
        { name: "c", age: 20 },
        { name: "d", age: 21 }
      ]
    });
    // this.setState({
    //   a: true,
    //   b: true
    // });
  }

  //componentWillUpdate() {}

  render() {
    let { list } = this.state;

    return (
      <div name="tt" onClick={this.handleClick.bind(this)}>
        {list.map(item => (
          <Child key={item.name} data={item} />
        ))}
      </div>
    );
  }

  handleClick() {
    this.setState({
      list: [
        { name: "b", age: 19 },
        { name: "c", age: 20 },
        { name: "d", age: 21 },
        { name: "a", age: 18 }
      ]
    });
    // this.setState({
    //   a: true,
    //   b: false
    // });
  }
  componentDidMount() {}

  componentDidUpdate() {}
}

class Child extends React.Component {
  render() {
    let { name, age } = this.props.data;

    return (
      <div>
        name is {name}, age is {age}
      </div>
    );
  }
}

ReactDOM.render(
  <ComponentContainer type={{ custom: "myType" }} />,
  document.body
);
