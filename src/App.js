import React, { Component } from 'react';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleStationClick = this.handleStationClick.bind(this);
    this.handleStationSearch = this.handleStationSearch.bind(this);

    this.state = {
      stationName: '',
      stationList: [],
      selectedStation: {},
      selectedStationArrivals: {}
    };

    this.settings = {
      // isProd: true,
      isProd: process.env.NODE_ENV === 'production',
      arrivalsLimit: 2
    }
  }

  handleStationClick(station) {
    this.setState({ selectedStation: station, selectedStationArrivals: {} });
    this.searchStationArrivals(station).then((data) => this.setState({ selectedStationArrivals: data.slice(0, this.settings.arrivalsLimit) }));
  }

  handleStationSearch(evt) {
    let name = evt.target.value;
    this.setState({ stationName: name, stationList: [], selectedStation: {} });
    this.searchStationName(evt.target.value).then((data) => this.setState({ stationList: data.matches }));
  }

  fetchStationData(endpoint, params) {
    const API_URL = this.settings.isProd ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
    const API_AUTH = `?app_id=${process.env.REACT_APP_PROD_API_ID}&app_key=${process.env.REACT_APP_PROD_API_KEY}`;
    const API_ENDPOINT = endpoint;

    let url = API_URL + API_ENDPOINT + API_AUTH; /* Build HTTP request URL */

    if (params) {
      url += `&${params.join('&')}`; /* Add additional query strings */
    }

    /* Fetch from TFL API */
    return fetch(url, { method: 'get' })
      .then((res) => res.json())
      .catch((err) => console.log('error: ', err));
  }

  searchStationName(name) {
    let endpoint = this.settings.isProd ? `Stoppoint/Search/${name}` : 'mock-data.json';
    let param = ['modes=tube'];
    return this.fetchStationData(endpoint, param);
  }

  searchStationArrivals(station) {
    let endpoint = this.settings.isProd ? `Stoppoint/${station.id}/Arrivals` : 'mock-arrivals.json';
    return this.fetchStationData(endpoint);
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Welcome to My Stop</h1>
        </div>
        <StationForm stationName={this.state.stationName} onChange={this.handleStationSearch} />
        <StationList stationList={this.state.stationList} selectedStation={this.state.selectedStation} onClick={this.handleStationClick} />
        <StationArrivals selectedStationArrivals={this.state.selectedStationArrivals} />
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

class StationArrivals extends Component {
  formatEta(mins) {
    let eta = Math.floor(mins / 60);
    return eta === 0 ? `Due` : `${eta} min`;
  }

  render() {
    let arrivalEle = null;
    const arrivals = this.props.selectedStationArrivals;

    if(typeof arrivals === 'object' && Object.keys(arrivals).length) {
      arrivalEle = arrivals.map((arrival) =>
        <div key={arrival.id}>
          <h2>{arrival.destinationName} <small>{this.formatEta(arrival.timeToStation)}</small></h2>
          <h3>Currently {arrival.currentLocation}</h3>
        </div>
      );
    } else {
      arrivalEle = <h3>Sorry, no arrival information available 🙁</h3>;
    }

    return (
      <div>{arrivalEle}</div>
    );
  }
}

export default App;
