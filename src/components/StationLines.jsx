import React, { Component } from 'react';

class StationLines extends Component {
  render() {
    let lines = this.props.selectedStopLines.map((line) => <li key={line.lineId} onClick={() => this.props.onLineSelect(line)}>{line.lineName}</li> );

    return (
      <div>
        <h3>Select a line</h3>
        <ul>{lines}</ul>
      </div>
    );
  }
}

export default StationLines;
