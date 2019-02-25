let React = require("React");
let ReactDOM = require("ReactDOM");

class ComponentContainer extends React.Component {
  componentWillMount() {
    window.setTimeout(() => {
      this.setState({ x: 9 });
      this.setState({ x: 10 });
    }, 3000);
  }

  componentWillUpdate() {}

  render() {
    return (
      <div name="tt" onClick={this.handleClick.bind(this)} obj={{ x: 1 }}>
        {1}
        <Child />
        <Child />
      </div>
    );
  }

  handleClick() {
    // this.setState({ x: 7 });
    // this.setState({ x: 8 });
    console.log("a");
  }
  componentDidMount() {}

  componentDidUpdate() {}
}

class Child extends React.Component {
  render() {
    return <div>child</div>;
  }
}

ReactDOM.render(
  <ComponentContainer type={{ custom: "myType" }} />,
  document.body
);
