import React, { Component } from 'react';

class StationLines extends Component {
  render() {
    let lines = this.props.selectedStopLines.map((line) => <li key={line} onClick={() => this.props.onLineSelect(line)}>{line}</li> );

    return (
      <div>
        <h3>Select a line</h3>
        <ul>{lines}</ul>
      </div>
    );
  }
}

export default StationLines;
