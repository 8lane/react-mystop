import React, { Component } from 'react';
import * as _ from 'lodash';

import Loader from './components/AppLoader';
import StationList from './components/StationList';
import StationForm from './components/StationForm';
import StationLines from './components/StationLines';
import StationArrivals from './components/StationArrivals';

var classNames = require('classnames');

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.handleLineClick = this.handleLineClick.bind(this);
    this.handleStopClick = this.handleStopClick.bind(this);
    this.handleStopSearch = this.handleStopSearch.bind(this);
    this.handleStopChange = this.handleStopChange.bind(this);
    this.handleStopRefresh = this.handleStopRefresh.bind(this);

    this.state = {
      stopName: '',
      stopList: [],
      selectedStop: {},
      selectedStopLines: [],
      selectedStopArrivals: {},
      isLoading: true,
      wizardCurrentStep: 1
    };

    this.settings = {
      isProd: true,
      // isProd: process.env.NODE_ENV === 'production',
      arrivalsLimit: 2
    }
  }

  componentDidMount() {
    let lsStopData = JSON.parse(localStorage.getItem('ms_stopData'));
    lsStopData && this.handleStopClick(lsStopData); /* If we have a saved stop, load a fresh set of arrival info & update state */
    this.setState({ isLoading: false });
  }

  handleStopSearch(evt) {
    let name = evt.target.value;
    this.setState({ stopName: name, stopList: [], selectedStop: {} });
    this.searchStopName(evt.target.value).then((data) => this.setState({ stopList: data.matches }));
  }

  handleStopClick(stop) {
    this.setState({ selectedStop: stop, selectedStopArrivals: {} });
    this.searchStopArrivals(stop).then((data) => {
      let stopLines = _.sortedUniq(data.map((arrival) => arrival.lineName));
      let hasMultipleLines = stopLines.length > 1;

      console.log('LINES: ', stopLines);

      this.setState({
        selectedStopLines: stopLines,
        selectedStopArrivals: hasMultipleLines ? data : data.slice(0, this.settings.arrivalsLimit),
        wizardCurrentStep: hasMultipleLines ? 2 : 3
      });

      if(!hasMultipleLines) {
        localStorage.setItem('ms_stopData', JSON.stringify(stop));
      }
    });
  }


  handleStopChange(step) {
    this.setState({
      stopName: '', // Reset searched stop
      selectedStop: {}, // Reset selected stop
      wizardCurrentStep: step
    });

    localStorage.removeItem('ms_stopData');
  }

  handleStopRefresh() {
    this.handleStopClick(this.state.selectedStop);
  }

  handleLineClick(line) {
    let arrivals = this.state.selectedStopArrivals.filter((arrival) => arrival.lineName === line);

    this.setState({
      selectedStopArrivals: arrivals.slice(0, this.settings.arrivalsLimit),
      wizardCurrentStep: 3
    });
  }

  fetchStopData(endpoint, params) {
    const API_URL = this.settings.isProd ? process.env.REACT_APP_PROD_API_URL : process.env.REACT_APP_DEV_API_URL;
    const API_AUTH = `?app_id=${process.env.REACT_APP_PROD_API_ID}&app_key=${process.env.REACT_APP_PROD_API_KEY}`;
    const API_ENDPOINT = endpoint;

    let url = API_URL + API_ENDPOINT + API_AUTH; /* Build HTTP request URL */

    if (params) {
      url += `&${params.join('&')}`; /* Add additional query strings */
    }

    this.setState({ isLoading: true }); /* Start loader */

    /* Fetch from TFL API */
    return fetch(url, { method: 'get' })
      .then((res) => {
        this.setState({ isLoading: false });
        return res.json();
      })
      .catch((err) => console.log('error: ', err));
  }

  searchStopName(name) {
    let endpoint = this.settings.isProd ? `Stoppoint/Search/${name}` : 'mock-data.json';
    let param = ['modes=tube&faresOnly=true&maxResults=10'];
    return this.fetchStopData(endpoint, param);
  }

  searchStopArrivals(stop) {
    let endpoint = this.settings.isProd ? `Stoppoint/${stop.id}/Arrivals` : 'mock-arrivals.json';
    return this.fetchStopData(endpoint);
  }

  render() {
    let wizardContent = null;
    let loader = null;

    if(this.state.wizardCurrentStep === 1) {
      wizardContent =
      <div>
        <StationForm stopName={this.state.stopName} onChange={this.handleStopSearch} />
        <StationList stopList={this.state.stopList} selectedStop={this.state.selectedStop} onStopSelect={this.handleStopClick} />
      </div>;
    }

    if(this.state.wizardCurrentStep === 2) {
      wizardContent = <div><StationLines selectedStopLines={this.state.selectedStopLines} onLineSelect={this.handleLineClick} /></div>
    }

    if(this.state.wizardCurrentStep === 3) {
      wizardContent = <div>
        <StationArrivals
          selectedStopArrivals={this.state.selectedStopArrivals}
          selectedStopLines={this.state.selectedStopLines}
          onStopChange={this.handleStopChange}
          onStopRefresh={this.handleStopRefresh}
        />
      </div>
    }

    if(this.state.isLoading) {
      loader = <div className="ms-loader"><Loader /></div>
    }

    let appClasses = classNames({
      'ms-app': true,
      'ms-app--loading': this.state.isLoading
    });

    return (
      <div className="{appClasses}">
        {loader}
        <div className="ms-wizard">
          {wizardContent}
        </div>
      </div>
    );
  }
}

export default App;
