let React = require("React");
let ReactDOM = require("ReactDOM");

class ComponentContainer extends React.Component {
  componentWillMount() {
      this.setState({ x: 2 }); 
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

ReactDOM.render(
  <ComponentContainer type={{ custom: "myType" }} />,
  document.body
);
