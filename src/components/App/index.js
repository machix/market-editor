import React, { Component } from 'react'
import NotificationsSystem from 'reapop'
import { connect } from 'react-redux'
import DistrictsMap from '../DistrictsMap'
import { fetchMarkets } from '../../redux/markets/actions'
import SideDrawer from '../SideDrawer'
import { find } from 'lodash'
import theme from 'reapop-theme-bootstrap'
import { notify } from 'reapop'
import styles from './styles.module.less'


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedMarket: 1,
      center: { lat: 38.189121453125, lng: -121.238344 },
      loading: false,
    }
  }

  componentDidMount() {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
      this.props.notify({
        message: 'No authentication token found!',
        status: 'error',
        position: 'tl',
      })
    }

    this.loadData()
  }

  render() {
    const { markets } = this.props
    const { selectedMarket, center, loading } = this.state

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
          loading={loading}
        />
        <NotificationsSystem theme={theme} />
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

  loadData = () => {
    this.setState({ loading: true })
    this.props.fetchMarkets()
    .then(() => {
      this.setState({ loading: false })
    })
    .catch(error => {
      this.setState({ loading: false })
      this.props.notify({
        message: error.message,
        status: 'error',
        position: 'tl',
      })
    })
  }
}

const mapStateToProps = state => ({
  markets: state.markets,
})

const mapDispatchToProps = {
  notify,
  fetchMarkets,
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
