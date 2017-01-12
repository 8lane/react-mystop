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
  }

  handleStationClick(station) {
    this.setState({ selectedStation: station, selectedStationArrivals: {} });

    this.searchArrivals(station).then((data) => {
      console.log('ARRIVALS ', data)
      this.setState({ selectedStationArrivals: data });
    });
  }

  handleStationSearch(evt) {
    let name = evt.target.value;

    this.setState({ stationName: name, stationList: [], selectedStation: {} });

    this.searchStation(evt.target.value).then((data) => {
      this.setState({ stationList: data.matches });
    });

  }

  searchArrivals(station) {
    const API_URL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
    const API_ENDPOINT = process.env.NODE_ENV === 'development' ? `Stoppoint/${station.id}/Arrivals` : 'mock-arrivals.json';

    return fetch(API_URL + API_ENDPOINT + `?app_id=${process.env.REACT_APP_PROD_API_ID}&app_key=${process.env.REACT_APP_PROD_API_KEY}`,
      { method: 'get' })
      .then((res) => {
        return res.json();
      })
      .catch((err) => {
        console.log('error: ', err);
      });
  }

  searchStation(name) {
    const API_URL = process.env.NODE_ENV === 'development' ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
    const API_ENDPOINT = process.env.NODE_ENV === 'development' ? `Stoppoint/Search/${name}` : 'mock-data.json';

    return fetch(API_URL + API_ENDPOINT + `?modes=tube&app_id=${process.env.REACT_APP_PROD_API_ID}&app_key=${process.env.REACT_APP_PROD_API_KEY}`,
      { method: 'get' })
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
  render() {
    if(!this.props.selectedStationArrivals.hasOwnProperty('id')) {
      return null;
    }

    const arrivalDetails = this.props.selectedStationArrivals;

    return (
      <div>
        <h2>{arrivalDetails.destinationName}</h2>
        <h3>Currently {arrivalDetails.currentLocation}</h3>
        <p>Expected: {arrivalDetails.expectedArrival}</p>
      </div>
    );
  }
}

export default App;
