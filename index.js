let React = require("React");
let ReactDOM = require("ReactDOM");

class ComponentContainer extends React.Component {
  componentWillMount() {
    debugger;
    this.setState({ x: 7 });
  }

  componentWillUpdate() {}

  render() {
    let { x } = this.state;

    return <div name="tt" obj={{ x, y: 2 }} />;
  }

  componentDidMount() {}

  componentDidUpdate() {}
}
debugger;
ReactDOM.render(
  <ComponentContainer type={{ custom: "myType" }} />,
  document.body
);
