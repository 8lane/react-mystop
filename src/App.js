import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.stationList = null;
    this.handleStationSearch = this.handleStationSearch.bind(this);
    this.state = { stationName: '', stationList: [] };
  }

  handleStationSearch(evt) {
    let name = evt.target.value;

    this.setState({ stationName: name });

    this.searchStation(evt.target.value).then((data) => {
      this.setState({ stationList: data.matches });
    });

  }

  searchStation(name) {
    return fetch('/public/data/mock-data.json', { method: 'get' })
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        console.log('error: ', err);
      });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Welcome to My Stop</h1>
        </div>
        <StationForm stationName={this.state.stationName} onChange={this.handleStationSearch} />
        <StationList stationList={this.state.stationList} />
      </div>
    );
  }
}

class StationForm extends Component {
  render() {
    return (
      <label htmlFor="station">
        Enter a station name:
        <input id="station" value={this.props.stationName} onChange={this.props.onChange} />
      </label>
    );
  }
}

class StationList extends Component {
  render() {
    const stationList = this.props.stationList.map((station) =>
      <p key={station.id}>{station.name}</p>
    );

    return (
      <div>stations:
      {stationList}
      </div>
    );
  }
}

export default App;
