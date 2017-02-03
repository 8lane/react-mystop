import React, { Component } from 'react';
import Loader from './components/AppLoader';
import StationWizard from './components/StationWizard';
import './App.css';

const classNames = require('classnames');

class App extends Component {
  constructor(props) {
    super(props);
    this.handleProcessing = this.handleProcessing.bind(this);

    this.state = {
      isLoading: true
    };
  }

  componentDidMount() {
    this.handleProcessing(false);
  }

  handleProcessing(loading) {
    this.setState({
      isLoading: loading
    })
  }

  render() {
    let appClasses = classNames({
      'ms-app': true,
      'ms-app--loading': this.state.isLoading
    });

    return (
      <main className="{appClasses}">
        <Loader isLoading={this.state.isLoading} />
        <StationWizard
          isLoading={this.state.isLoading}
          onProcessing={this.handleProcessing}
        />
      </main>
    );
  }
}

export default App;
