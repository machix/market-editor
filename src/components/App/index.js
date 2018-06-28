import React, { Component } from 'react'
import DistrictsMap from '../DistrictsMap'

class App extends Component {
  render() {
    return (
      <div className="App">
        <DistrictsMap
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyA-IoadHajFzU9-bSP4IA4NZRyM7Y0JuRg&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: `100%` }} />}
          containerElement={<div style={{ height: `800px` }} />}
          mapElement={<div style={{ height: `100%` }} />}
        />
      </div>
    );
  }
}

export default App
