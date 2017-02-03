import React, { Component } from 'react';

class StationList extends Component {
  isSelectedStop(id) {
    if (this.props.selectedStop.id === id) {
      return 'active';
    }
  }

  render() {
    let stopList = null;

    if(this.props.stopList && this.props.stopList.length) {
      stopList = this.props.stopList.map((stop) =>
        <p key={stop.id} className={this.isSelectedStop(stop.id)} onClick={() => this.props.onStopSelect(stop)}>{stop.name}</p>
      );
    } else {
      stopList = <p>No stations found, try searching!</p>;
    }

    return (
      <div>{stopList}</div>
    );
  }
}

export default StationList;
