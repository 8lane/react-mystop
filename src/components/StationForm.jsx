import React, { Component } from 'react';

class StationForm extends Component {
  render() {
    return (
      <label htmlFor="station">
        Enter a station name:
        <input id="station" value={this.props.stopName} onChange={this.props.onChange} />
      </label>
    );
  }
}

export default StationForm;
