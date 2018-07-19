import React, { Component } from 'react'
import NotificationsSystem from 'reapop'
import { connect } from 'react-redux'
import MarketsMap from '../MarketsMap'
import {
  fetchMarkets,
  fetchMarket,
  updateDistrict,
  updateStartingPoint,
  createDistrict,
  createStartingPoint,
  deleteDistrict,
  deleteStartingPoint,
} from '../../redux/markets/actions'
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
      selectedMarket: '',
      selectedRegion: '',
      selectedTool: 'districtEditor',
      formData: {},
      editing: false,
      canceling: false,
      saving: false,
      deleting: false,
      showInfoWindow: false,
      center: { lat: 37.7045000000128, lng: -120.89549999995776 },
    }
  }

  componentDidMount() {
    // const authToken = localStorage.getItem('authToken')
    //
    // if (!authToken) {
    //   this.props.notify({
    //     message: 'No authentication token found!',
    //     status: 'error',
    //     position: 'tc',
    //   })
    // }

    this.loadData()
  }

  render() {
    const {
      markets,
      market,
      updateDistrict,
      updateStartingPoint,
      createDistrict,
      createStartingPoint,
    } = this.props
    const {
      selectedMarket,
      selectedRegion,
      selectedTool,
      center,
      editing,
      canceling,
      deleting,
      saving,
      formData,
      showInfoWindow,
    } = this.state

    return (
      <div className={styles.app}>
        <MarketsMap
          googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyA-IoadHajFzU9-bSP4IA4NZRyM7Y0JuRg&v=3.exp&libraries=geometry,drawing,places"
          loadingElement={<div style={{ height: '100%' }} />}
          containerElement={<div style={{ height: '100vh', width: '100%' }} />}
          mapElement={<div style={{ height: '100%' }} />}
          center={center}
          market={market}
          selectedRegion={selectedRegion}
          selectedTool={selectedTool}
          handleEdit={this.handleEdit}
          handleClickFeature={this.handleClickFeature}
          clearSelection={this.clearSelection}
          editing={editing}
          canceling={canceling}
          deleting={deleting}
          saving={saving}
          formData={formData}
          handleCancelDone={this.handleCancelDone}
          handleDeleteDone={this.handleDeleteDone}
          handleSaveDone={this.handleSaveDone}
          showPolygonInfoWindow={this.showPolygonInfoWindow}
          updateDistrict={updateDistrict}
          updateStartingPoint={updateStartingPoint}
          createDistrict={createDistrict}
          createStartingPoint={createStartingPoint}
          deleteDistrict={deleteDistrict}
          deleteStartingPoint={deleteStartingPoint}
        />
        <SideDrawer
          handleSelectMarketChange={this.handleSelectMarketChange}
          selectedMarket={selectedMarket}
          handleSelectRegionChange={this.handleSelectRegionChange}
          selectedRegion={selectedRegion}
          handleSelectToolChange={this.handleSelectToolChange}
          selectedTool={selectedTool}
          markets={markets}
          market={market}
          loading={markets.loading || market.loading}
          editing={editing}
          handleEdit={this.handleEdit}
          handleCancel={this.handleCancel}
          handleSave={this.handleSave}
          handleDelete={this.handleDelete}
          showInfoWindow={showInfoWindow}
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

  handleSelectRegionChange = (event) => {
    const selectedRegion = event.target.value
    if (selectedRegion !== this.state.selectedRegion) {
      const market = this.props.market
      let region
      if (this.state.selectedTool === 'districtEditor') {
        region = find(market.data.districts, ['id', selectedRegion])
      } else {
        region = find(market.data.starting_points, ['id', selectedRegion])
      }

      const center = region.geom && turf.center(region.geom)
      if (center) {
        this.setState({
          center: { lat: center.geometry.coordinates[1] , lng: center.geometry.coordinates[0] },
        })
      }

      this.setState({
        selectedRegion,
      })
    }
  }

  handleSelectToolChange = (event) => {
    const selectedTool = event.target.value
    if (selectedTool !== this.state.selectedTool) {
      this.setState({
        selectedTool,
      })
    }
  }

  clearSelection = () => {
    this.setState({
      selectedRegion: '',
      editing: false,
    })
  }

  handleClickFeature = (feature) => {
    if (feature) {
      const featureId = feature.getProperty('id')
      this.setState({
        selectedRegion: featureId,
      })
    } else {
      this.setState({
        selectedRegion: '',
      })
    }
    this.setState({
      showInfoWindow: false,
    })
  }

  handleEdit = () => {
    this.setState({ editing: true })
  }

  handleCancel = () => {
    this.setState({
      editing: false,
      canceling: true,
    })
  }

  handleCancelDone = ({ closeInfoWindow } = {}) => {
    this.setState({
      canceling: false,
      editing: false,
    })
    if (closeInfoWindow) {
      this.setState({ showInfoWindow: false })
    }
  }

  handleDelete = (id) => {
    const { selectedTool } = this.state
    if (selectedTool === 'districtEditor') {
      return this.props.deleteDistrict(id).then((response) => {
        this.setState({
          selectedRegion: '',
          editing: false,
          deleting: true,
        })
        return response
      })
    } else {
      return this.props.deleteStartingPoint(id).then((response) => {
        this.setState({
          selectedRegion: '',
          editing: false,
          deleting: true,
        })
        return response
      })
    }
  }

  handleDeleteDone = () => {
    this.setState({
      deleting: false,
    })
  }

  handleSave = (formData) => {
    this.setState({
      formData,
    }, () => {
      this.setState({
        saving: true,
        editing: false,
      })
    })
  }

  handleSaveDone = (response) => {
    const { error } = response
    this.setState({
      saving: false,
    })
    if (error && error.message) {
      this.setState({
        selectedRegion: '',
        showInfoWindow: false,
        formData: '',
      })
      this.props.notify({
        message: error.message,
        status: 'error',
        position: 'tc',
      })
    } else {
      this.props.notify({
        message: 'Your changes have been saved!',
        status: 'success',
        position: 'tc',
      })
    }
  }

  showPolygonInfoWindow = () => {
    this.setState({
      showInfoWindow: true,
      editing: true,
    })
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

    // this.props.fetchMarket(this.state.selectedMarket)
    // .then(response => {
    //   if (response.error) {
    //     this.props.notify({
    //       message: response.error.message,
    //       status: 'error',
    //       position: 'tc',
    //     })
    //   }
    // })
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
  updateDistrict,
  updateStartingPoint,
  createDistrict,
  createStartingPoint,
  deleteDistrict,
  deleteStartingPoint,
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
