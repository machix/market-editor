import React, { Component } from 'react'
import NotificationsSystem from 'reapop'
import { connect } from 'react-redux'
import MarketsMap from '../MarketsMap'
import { fetchMarkets, fetchMarket } from '../../redux/markets/actions'
import SideDrawer from '../SideDrawer'
import theme from 'reapop-theme-wybo'
import { notify } from 'reapop'
import styles from './styles.module.less'
import { find } from 'lodash'
import * as turf from '@turf/turf'


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showInfoWindow: false,
      selectedMarket: 1,
      selectedDistrict: '',
      center: { lat: 37.7045000000128, lng: -120.89549999995776 },
    }
  }

  componentDidMount() {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      this.props.notify({
        message: 'No authentication token found!',
        status: 'error',
        position: 'tc',
      })
    }

    this.loadData()
  }

  render() {
    const { markets, market } = this.props
    const { selectedMarket, selectedDistrict, center, showInfoWindow } = this.state

    return (
      <div className={styles.app}>
        <MarketsMap
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyA-IoadHajFzU9-bSP4IA4NZRyM7Y0JuRg&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: '100%' }} />}
          containerElement={<div style={{ height: '100vh', width: '100%' }} />}
          mapElement={<div style={{ height: '100%' }} />}
          center={center}
          market={market}
          showInfoWindow={showInfoWindow}
          selectedDistrict={selectedDistrict}
        />
        <SideDrawer
          handleSelectMarketChange={this.handleSelectMarketChange}
          selectedMarket={selectedMarket}
          handleSelectDistrictChange={this.handleSelectDistrictChange}
          selectedDistrict={selectedDistrict}
          markets={markets}
          loading={markets.loading || market.loading}
        />
        <NotificationsSystem theme={theme} />
      </div>
    )
  }

  handleSelectMarketChange = (event) => {
    const selectedMarket = event.target.value
    if (selectedMarket !== this.state.selectedMarket) {
      const market = find(this.props.markets.data, ['id', selectedMarket])
      const center = market.center ? { lat: market.center.coordinates[1], lng: market.center.coordinates[0] } : this.state.center

      this.setState({
        selectedMarket,
        center,
      }, () => {
        this.props.fetchMarket(this.state.selectedMarket)
        .then(response => {
          if (response.error) {
            this.props.notify({
              message: response.error.message,
              status: 'error',
              position: 'tc',
            })
          }
        })
      })
    }
  }

  handleSelectDistrictChange = (event) => {
    const selectedDistrict = event.target.value
    if (selectedDistrict !== this.state.selectedDistrict) {
      const market = this.props.market
      const district = find(market.data.districts, ['id', selectedDistrict])
      console.log(district)
      const center = turf.center(district.geom)
      console.log(center)

      this.setState({
        selectedDistrict,
        showInfoWindow: true,
        center: { lat: center.geometry.coordinates[1] , lng: center.geometry.coordinates[0] },
      })
    }
  }

  loadData = () => {
    this.props.fetchMarkets()
    .then(response => {
      if (response.error) {
        this.props.notify({
          message: response.error.message,
          status: 'error',
          position: 'tc',
        })
      }
    })

    this.props.fetchMarket(this.state.selectedMarket)
    .then(response => {
      if (response.error) {
        this.props.notify({
          message: response.error.message,
          status: 'error',
          position: 'tc',
        })
      }
    })
  }
}

const mapStateToProps = state => ({
  markets: state.markets,
  market: state.market,
})

const mapDispatchToProps = {
  notify,
  fetchMarkets,
  fetchMarket,
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
