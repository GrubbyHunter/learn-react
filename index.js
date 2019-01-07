let React = require("React");
let ReactDOM = require("ReactDOM");

class ComponentContainer extends React.Component {
  componentWillMount() {
    window.setTimeout(() => {
      this.setState({ x: 1 });
      this.setState({ x: 2 });
    }, 3000);
  }

  componentWillUpdate() {}

  render() {
    let { x } = this.state;

    return (
      <div name="tt" onClick={this.handleClick.bind(this)} obj={x}>
        {x}
      </div>
    );
  }

  handleClick() {}
  componentDidMount() {}

  componentDidUpdate() {}
}
debugger;
ReactDOM.render(
  <ComponentContainer type={{ custom: "myType" }} />,
  document.body
);
