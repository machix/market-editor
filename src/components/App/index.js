import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NotificationsSystem from 'reapop'
import { connect } from 'react-redux'
import MarketsMap from '../MarketsMap'
import {
  fetchMarketList,
  fetchMarket,
  updateDistrict,
  updateStartingPoint,
  createDistrict,
  createStartingPoint,
  deleteDistrict,
  deleteStartingPoint,
} from '../../actions'
import SideDrawer from '../SideDrawer'
import theme from 'reapop-theme-wybo'
import { notify } from 'reapop'
import styles from './styles.module.less'
import { find } from 'lodash'
import * as turf from '@turf/turf'


class App extends Component {
  static propTypes = {
    marketList: PropTypes.object,
    selectedMarket: PropTypes.object, 
    fetchMarketList: PropTypes.func.isRequired,
    fetchMarket: PropTypes.func.isRequired,
    updateDistrict: PropTypes.func.isRequired,
    updateStartingPoint: PropTypes.func.isRequired,
    createDistrict: PropTypes.func.isRequired,
    createStartingPoint: PropTypes.func.isRequired,
    deleteDistrict: PropTypes.func.isRequired,
    deleteStartingPoint: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      selectedMarketId: '',
      selectedRegionId: '',
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
    this.loadData()
  }

  render() {
    const {
      marketList,
      selectedMarket,
      updateDistrict,
      updateStartingPoint,
      createDistrict,
      createStartingPoint,
      notify,
    } = this.props
    const {
      selectedMarketId,
      selectedRegionId,
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
          market={selectedMarket}
          selectedRegionId={selectedRegionId}
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
          notify={notify}
        />
        <SideDrawer
          handleSelectMarketChange={this.handleSelectMarketChange}
          selectedMarketId={selectedMarketId}
          handleSelectRegionChange={this.handleSelectRegionChange}
          selectedRegionId={selectedRegionId}
          handleSelectToolChange={this.handleSelectToolChange}
          selectedTool={selectedTool}
          markets={marketList}
          market={selectedMarket}
          loading={marketList.loading || selectedMarket.loading}
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
    const selectedMarketId = event.target.value
    if (selectedMarketId !== this.state.selectedMarketId) {
      const market = find(this.props.marketList.data, ['id', selectedMarketId])
      const center = market.center ? { lat: market.center.coordinates[1], lng: market.center.coordinates[0] } : this.state.center

      this.setState({
        selectedMarketId,
        center,
        editing: false,
        selectedRegionId: '',
        showInfoWindow: false,
      }, () => {
        this.props.fetchMarket(this.state.selectedMarketId)
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
    const selectedRegionId = event.target.value
    if (selectedRegionId !== this.state.selectedRegionId) {
      const market = this.props.selectedMarket
      let region
      if (this.state.selectedTool === 'districtEditor') {
        region = find(market.data.districts, ['id', selectedRegionId])
      } else {
        region = find(market.data.starting_points, ['id', selectedRegionId])
      }

      const center = region.geom && turf.center(region.geom)
      if (center) {
        this.setState({
          center: { lat: center.geometry.coordinates[1] , lng: center.geometry.coordinates[0] },
        })
      }

      this.setState({
        selectedRegionId,
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
    this.clearSelection()
  }

  clearSelection = () => {
    this.setState({
      selectedRegionId: '',
      editing: false,
      showInfoWindow: false,
    })
  }

  handleClickFeature = (feature) => {
    if (feature) {
      const featureId = feature.getProperty('id')
      if (this.state.selectedRegionId !== featureId) {
        this.setState({
          selectedRegionId: featureId,
        })
      }
    } else {
      this.setState({
        selectedRegionId: '',
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
      this.setState({
        selectedRegionId: '',
        showInfoWindow: false
      })
    }
  }

  handleDelete = (id) => {
    const { selectedTool } = this.state
    if (selectedTool === 'districtEditor') {
      return this.props.deleteDistrict(id).then((response) => {
        this.setState({
          selectedRegionId: '',
          editing: false,
          deleting: true,
        })
        return response
      })
    } else {
      return this.props.deleteStartingPoint(id).then((response) => {
        this.setState({
          selectedRegionId: '',
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
      showInfoWindow: false,
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
    if (response) {
      if (response.error) {
        this.setState({
          selectedRegionId: '',
          formData: '',
          saving: false,
        })
        let errorMessage = 'Unknown error has occured. Please refresh the page'
        if (response.error.message) {
          errorMessage = response.error.message
        }
        this.props.notify({
          message: errorMessage,
          status: 'error',
          position: 'tc',
        })
     } else {
       this.setState({
         saving: false,
         editing: false,
         showInfoWindow: false,
       }, () => {
         this.setState({ selectedRegionId: '' })
       })
       this.props.notify({
         message: 'Your changes have been saved!',
         status: 'success',
         position: 'tc',
       })
     }
   } else {
     this.setState({
       saving: false,
       editing: true,
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
    this.props.fetchMarketList()
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
  marketList: state.marketList,
  selectedMarket: state.selectedMarket,
})

const mapDispatchToProps = {
  notify,
  fetchMarketList,
  fetchMarket,
  updateDistrict,
  updateStartingPoint,
  createDistrict,
  createStartingPoint,
  deleteDistrict,
  deleteStartingPoint,
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
