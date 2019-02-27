let React = require("React");
let ReactDOM = require("ReactDOM");

class ComponentContainer extends React.Component {
  componentWillMount() {
    // this.setState({
    //   list: [
    //     { name: "a", age: 18 },
    //     { name: "b", age: 19 },
    //     { name: "c", age: 20 }
    //   ]
    // });
    this.setState({
      a: true,
      b: true
    });
  }

  componentWillUpdate() {}

  render() {
    let { a, b } = this.state;

    return (
      <div name="tt" onClick={this.handleClick.bind(this)}>
        {a && <div>a{!b && <div>b</div>}</div>}
        {b && <div>b</div>}
        {/* {list.map((item, index) => (
          <Child key={index} data={item} />
        ))} */}
      </div>
    );
  }

  handleClick() {
    // this.setState({
    //   list: [
    //     { name: "a", age: 18 },
    //     { name: "d", age: 19 },
    //     { name: "c", age: 20 }
    //   ]
    // });
    this.setState({
      a: true,
      b: false
    });
  }
  componentDidMount() {}

  componentDidUpdate() {}
}

class Child extends React.Component {
  render() {
    let { name, age } = this.props;

    return (
      <div>
        name is ${name}, age is ${age}
      </div>
    );
  }
}

ReactDOM.render(
  <ComponentContainer type={{ custom: "myType" }} />,
  document.body
);
