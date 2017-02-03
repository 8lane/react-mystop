import React, { Component } from 'react';

class AppLoader extends Component {
  render() {
    let loader = this.props.isLoading ? <div>loading</div> : null;

    return (
      <div>{loader}</div>
    );
  }
}

export default AppLoader;
