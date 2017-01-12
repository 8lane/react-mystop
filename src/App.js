import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleStationClick = this.handleStationClick.bind(this);
    this.handleStationSearch = this.handleStationSearch.bind(this);

    this.state = { stationName: '', stationList: [], selectedStation: {} };
  }

  handleStationClick(station) {
    this.setState({ selectedStation: station });
  }

  handleStationSearch(evt) {
    let name = evt.target.value;

    this.setState({ stationName: name, stationList: [], selectedStation: {} });

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
        <StationList stationList={this.state.stationList} selectedStation={this.state.selectedStation} onClick={this.handleStationClick} />
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
  isSelectedStation(id) {
    if (this.props.selectedStation.id === id) {
      return 'active';
    }
  }

  render() {
    let stationList = null;

    if(this.props.stationList.length) {
      stationList = this.props.stationList.map((station) =>
                      <p key={station.id} className={this.isSelectedStation(station.id)} onClick={() => this.props.onClick(station)}>{station.name}</p>
                    );
    } else {
      stationList = <p>No stations found, try searching!</p>;
    }

    return (
      <div>{stationList}</div>
    );
  }
}

export default App;
