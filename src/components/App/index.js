import React, { Component } from 'react'
import { connect } from 'react-redux'
import DistrictsMap from '../DistrictsMap'
import { fetchMarkets } from '../../redux/markets/actions'
import SideDrawer from '../SideDrawer'
import { find } from 'lodash'
import styles from './styles.module.less'


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedMarket: 1,
      center: { lat: 38.189121453125, lng: -121.238344 },
    }
  }

  componentDidMount() {
    this.props.fetchMarkets()
  }

  render() {
    const { markets } = this.props
    const { selectedMarket, center } = this.state

    return (
      <div className={styles.app}>
        <DistrictsMap
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyA-IoadHajFzU9-bSP4IA4NZRyM7Y0JuRg&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: '100%' }} />}
          containerElement={<div style={{ height: '100vh', width: '100%' }} />}
          mapElement={<div style={{ height: '100%' }} />}
          center={center}
        />
        <SideDrawer
          handleSelectChange={this.handleSelectChange}
          selectedMarket={selectedMarket}
          markets={markets}
        />
      </div>
    )
  }

  handleSelectChange = (event) => {
    const selectedMarket = event.target.value
    const market = find(this.props.markets.data, ['id', selectedMarket])

    this.setState({
      selectedMarket,
      center: { lat: market.center.coordinates[1], lng: market.center.coordinates[0] },
     })
  }
}

const mapStateToProps = state => ({
  markets: state.markets,
})

const mapDispatchToProps = {
  fetchMarkets,
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
