import React, { Component } from 'react';
import * as _ from 'lodash';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleStopClick = this.handleStopClick.bind(this);
    this.handleStopSearch = this.handleStopSearch.bind(this);
    this.handleStopChange = this.handleStopChange.bind(this);

    this.state = {
      stopName: '',
      stopList: [],
      selectedStop: {},
      selectedStopArrivals: {},
      wizard: {
        currentStep: 1,
      }
    };

    this.settings = {
      // isProd: true,
      isProd: process.env.NODE_ENV === 'production',
      arrivalsLimit: 2
    }
  }

  componentDidMount() {
    let lsStopData = JSON.parse(localStorage.getItem('ms_stopData'));
    lsStopData && this.setState(lsStopData); /* update app state if we have a saved stop */
  }

  handleStopSearch(evt) {
    let name = evt.target.value;
    this.setState({ stopName: name, stopList: [], selectedStop: {} });
    this.searchStopName(evt.target.value).then((data) => this.setState({ stopList: data.matches }));
  }

  handleStopClick(stop) {
    this.setState({ selectedStop: stop, selectedStopArrivals: {} });
    this.searchStopArrivals(stop).then((data) => {
      let state = {
        selectedStopArrivals: data.slice(0, this.settings.arrivalsLimit),
        wizard: {
          currentStep: 2
        }
      };

      this.setState(state);
      localStorage.setItem('ms_stopData', JSON.stringify(state));
    });
  }

  handleStopChange(step) {
    this.setState({
      stopName: '', // Reset searched stop
      selectedStop: {}, // Reset selected stop
      wizard: {
        currentStep: step // update wizard step
      }
    });

    localStorage.removeItem('ms_stopData');
  }

  fetchStopData(endpoint, params) {
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

  searchStopName(name) {
    let endpoint = this.settings.isProd ? `Stoppoint/Search/${name}` : 'mock-data.json';
    let param = ['modes=tube'];
    return this.fetchStopData(endpoint, param);
  }

  searchStopArrivals(stop) {
    let endpoint = this.settings.isProd ? `Stoppoint/${stop.id}/Arrivals` : 'mock-arrivals.json';
    return this.fetchStopData(endpoint);
  }

  render() {
    let wizardContent = null;

    if(this.state.wizard.currentStep === 1) {
      wizardContent =
      <div>
        <StationForm stopName={this.state.stopName} onChange={this.handleStopSearch} />
        <StationList stopList={this.state.stopList} selectedStop={this.state.selectedStop} onStopSelect={this.handleStopClick} />
      </div>;
    } else {
      wizardContent = <div><StationArrivals selectedStopArrivals={this.state.selectedStopArrivals} onStopChange={this.handleStopChange} /></div>
    }

    return (
      <div className="App">
        {wizardContent}
      </div>
    );
  }
}

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

class StationList extends Component {
  isSelectedStop(id) {
    if (this.props.selectedStop.id === id) {
      return 'active';
    }
  }

  render() {
    let stopList = null;

    if(this.props.stopList.length) {
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

class StationArrivals extends Component {
  formatEta(mins) {
    let eta = Math.floor(mins / 60);
    return eta === 0 ? `Due` : `${eta} min`;
  }

  render() {
    let arrivalEle = null;
    const arrivals = this.props.selectedStopArrivals;

    if(typeof arrivals === 'object' && Object.keys(arrivals).length) {
      let sortedArrivals = _.sortBy(arrivals, 'timeToStation'); /* Re-order arrivals by time of arrival */

      arrivalEle = sortedArrivals.map((arrival) =>
        <div key={arrival.id}>
          <h2>{arrival.destinationName} <small>{this.formatEta(arrival.timeToStation)}</small></h2>
          <h3>Currently {arrival.currentLocation}</h3>
        </div>
      );
    } else {
      arrivalEle = <h3>Sorry, no arrival information available 🙁</h3>;
    }

    return (
      <div>
        <button onClick={() => this.props.onStopChange(1)}>Choose new stop</button>
        <div>{arrivalEle}</div>
      </div>
    );
  }
}

export default App;
