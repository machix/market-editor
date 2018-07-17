import React, { Component } from 'react'
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
} from 'react-google-maps'
import { isEmpty, find } from 'lodash'
import * as turf from '@turf/turf'
import DrawingManager from 'react-google-maps/lib/components/drawing/DrawingManager'
import { MAP } from 'react-google-maps/lib/constants'
import randomColor from 'random-color'
import styles from './styles.module.less'

class MarketsMap extends Component {
  constructor(props) {
    super(props)
    this.initialState = {
      oldGeometry: null,
      features: [],
      selectedFeature: null,
    }

    this.state = this.initialState
  }

  componentDidMount() {
    this.map = this.mapRef.context[MAP]
  }

  componentWillReceiveProps(nextProps) {
    const { market, selectedRegion, selectedTool } = nextProps
    const { selectedFeature } = this.state

    // Market Data Changed
    if (market.data && ((market.data.id !== this.props.market.data.id) || (selectedTool !== this.props.selectedTool))) {
      let regionsFeatureCollection
      if (selectedTool === 'districtEditor') {
        regionsFeatureCollection = this.createFeatureCollection(market.data.districts)
      } else {
        regionsFeatureCollection = this.createFeatureCollection(market.data.starting_points)
      }

      if (regionsFeatureCollection && !isEmpty((regionsFeatureCollection))) {
        this.resetFeatures(regionsFeatureCollection)

        this.map.data.setStyle((feature) => {
          return this.createStyle({
            fillColor: feature.getProperty('color'),
            fillOpacity: 0.5,
            strokeColor: feature.getProperty('color'),
            strokeOpacity: 1,
            strokeWeight: 2,
          })
        })

        this.map.data.addListener('click', (event) => {
          const feature = event.feature
          this.clearSelection()
          this.handleClickFeature(feature)
        })
      }

      this.map.addListener('click', () => {
        this.clearSelection()
        this.props.handleCancelDone({ closeInfoWindow: true })
      })
    }

    // Selected Region Changed
    if (selectedRegion && (selectedRegion!== this.props.selectedRegion)) {
      if (selectedFeature && this.isFeature(selectedFeature)) {
        this.map.data.overrideStyle(selectedFeature, {
          strokeColor: selectedFeature.getProperty('color'),
          strokeWeight: 2,
          zIndex: 1,
        })
        if (this.props.editing) {
          this.handleCancel()
        }
      }
      const newFeature = this.map.data.getFeatureById(selectedRegion)
      this.map.data.overrideStyle(newFeature, {
        strokeColor: '#3e4444',
        strokeWeight: 3,
        zIndex: 2,
      })
      this.setState({
        selectedFeature: newFeature,
      })
    }

    if (!this.props.editing && nextProps.editing) {
      this.handleEdit()
    }

    if (this.props.editing && !nextProps.editing && !nextProps.saving) {
      const { selectedFeature } = this.state
      if (this.isFeature(selectedFeature)) {
        this.map.data.overrideStyle(selectedFeature, { editable: false, draggable: false })
        if (this.state.oldGeometry) {
          selectedFeature.setGeometry(this.state.oldGeometry)
        }
      }
    }

    if (!this.props.canceling && nextProps.canceling) {
      this.handleCancel()
    }

    if (!this.props.deleting && nextProps.deleting) {
      this.handleDelete()
    }

    if (!this.props.saving && nextProps.saving) {
      this.handleSave()
    }
  }

  render() {
    const { center } = this.props

    const FILL_CAPACITY = 0.5
    const STROKE_CAPACITY = 1

    return (
      <GoogleMap
        ref={ref => this.mapRef = ref}
        defaultZoom={10}
        center={center}
      >
        <DrawingManager
          defaultOptions={{
            drawingControl: true,
            drawingControlOptions: {
              position: window.google.maps.ControlPosition.TOP_CENTER,
              drawingModes: [
                window.google.maps.drawing.OverlayType.POLYGON,
              ],
            },
            polygonOptions: {
              editable: true,
              draggable: true,
              fillOpacity: FILL_CAPACITY,
              strokeOpacity: STROKE_CAPACITY,
            },
          }}
          onPolygonComplete={this.handlePolygonComplete}
        />
      </GoogleMap>
    )
  }

  resetState = () => {
    this.setState(this.initialState)
  }

  handleClickFeature = (feature) => {
    if (this.isFeature(feature)) {
      this.props.handleClickFeature(feature)
      this.map.data.overrideStyle(feature, {
        strokeColor: '#3e4444',
        strokeWeight: 3,
        zIndex: 2,
      })
    } else {
      feature.setOptions({
        strokeColor: '#3e4444',
        strokeWeight: 3,
        zIndex: 2,
      })
    }
    this.setState({
      selectedFeature: feature,
    })
  }

  clearSelection = () => {
    const { selectedFeature } = this.state
    if (selectedFeature) {
      if (this.isFeature(selectedFeature)) {
        this.map.data.overrideStyle(selectedFeature, {
          strokeColor: selectedFeature.getProperty('color'),
          strokeWeight: 2,
          zIndex: 1,
        })
      } else {
        selectedFeature.setOptions({
          strokeWeight: 2,
          zIndex: 1,
        })
      }
    }
    this.props.clearSelection()
  }

  createStyle = ({ fillColor, fillOpacity, strokeColor, strokeOpacity, strokeWeight }) => {
    return {
      fillColor,
      fillOpacity,
      strokeColor,
      strokeOpacity,
      strokeWeight,
    }
  }

  handlePolygonComplete = (polygon) => {
    const htmlColor = randomColor().hexString()
    polygon.setOptions({
      fillColor: htmlColor,
      strokeColor: htmlColor,
    })
    this.clearSelection()
    this.handleClickFeature(polygon)
    this.showPolygonInfoWindow()
    window.google.maps.event.addListener(polygon, 'click', () => {
      this.clearSelection()
      this.handleClickFeature(polygon)
      this.showPolygonInfoWindow(polygon)
    })
  }

  showPolygonInfoWindow = () => {
    this.props.showPolygonInfoWindow()
  }

  handleEdit = () => {
      const { selectedFeature } = this.state

      this.props.handleEdit()

      if (this.isFeature(selectedFeature)) {
        this.map.data.overrideStyle(selectedFeature, { editable: true, draggable: true })
        this.setState({ oldGeometry: selectedFeature.getGeometry() })
      }
  }

  handleCancel = () => {
    const { selectedFeature } = this.state
    if (this.isFeature(selectedFeature)) {
      this.map.data.overrideStyle(selectedFeature, { editable: false, draggable: false })
      if (this.state.oldGeometry) {
        selectedFeature.setGeometry(this.state.oldGeometry)
      }
      this.props.handleCancelDone()
    } else {
      selectedFeature.setMap(null)
      this.props.handleCancelDone({ closeInfoWindow: true })
    }
  }

  handleSave = () => {
    const { formData, selectedRegion, selectedTool } = this.props
    const { selectedFeature } = this.state

    if (this.isFeature(selectedFeature)) {
      this.map.data.overrideStyle(selectedFeature, { editable: false, draggable: false })
      const difference = this.resolveFeatureCollision(selectedFeature)
      const payload = {
        ...formData,
        geom: difference.geometry,
        html_color:  difference.properties.color,
      }
      if (selectedTool === 'districtEditor') {
        this.props.updateDistrict(selectedRegion, payload).then(() => {
          this.props.handleSaveDone()
        })
      } else {
        this.props.updateStartingPoint(selectedRegion, payload).then(() => {
          this.props.handleSaveDone()
        })
      }
    } else {
      const newFeature = this.map.data.add({
        geometry: new window.google.maps.Data.Polygon([selectedFeature.getPaths().getAt(0).getArray()])
      })
      this.map.data.overrideStyle(newFeature, {
        editable: false,
        draggable: false,
        fillColor: selectedFeature.fillColor,
        strokeColor: selectedFeature.fillColor,
        fillOpacity: selectedFeature.fillOpacity,
      })
      // convert coordinates to geoJson
      let coordinates = []
      const paths = newFeature.getGeometry().getAt(0).getArray()
      paths.forEach(coord => {
        coordinates.push([coord.lng(), coord.lat()])
      })
      coordinates = [...coordinates, [...coordinates[0]]]
      const difference = this.resolveFeatureCollision(selectedFeature, turf.polygon([[...coordinates]], { color: selectedFeature.fillColor }))
      selectedFeature.setMap(null)
      const payload = {
        ...formData,
        geom: difference.geometry,
        html_color:  difference.properties.color,
      }
      if (selectedTool === 'districtEditor') {
        this.props.createDistrict(payload).then(() => {
          this.props.handleSaveDone()
        })
      } else {
        this.props.createStartingPoint(payload).then(() => {
          this.props.handleSaveDone()
        })
      }
    }
  }

  resolveFeatureCollision = (selectedFeature, newFeature) => {
    let difference
    let currentFeature
    this.map.data.toGeoJson((geoJsonCollection) => {
      turf.featureEach(geoJsonCollection, (feature) => {
        currentFeature = newFeature ? newFeature : find(geoJsonCollection.features, ['properties.id', selectedFeature.getProperty('id')])
        if (turf.getType(feature) === 'Polygon' && turf.booleanOverlap(currentFeature, feature)) {
          difference = turf.difference(currentFeature, feature)
          if (difference) {
            const coordinates = []
            difference.geometry.coordinates[0].forEach(coord => {
              coordinates.push(new window.google.maps.LatLng(coord[1], coord[0]))
            })
            const polygon = new window.google.maps.Data.Polygon([[...coordinates]])
            selectedFeature.setGeometry(polygon)
          }
        }
      })
    })
    return difference ? difference : currentFeature
  }

  handleDelete = () => {
    const { selectedFeature } = this.state

    if (this.isFeature(selectedFeature)) {
      this.map.data.remove(selectedFeature)
      this.props.handleDeleteDone()
    }
  }

  getPolygonCenter = (polygon) => {
    const bounds = new window.google.maps.LatLngBounds()
    const coordinates = polygon.getPath().getArray()
    for (var i = 0; i < coordinates.length; i++) {
      bounds.extend(coordinates[i])
    }

    return bounds.getCenter()
  }

  createFeatureCollection = (features) => {
    if (!isEmpty(features)) {
      const collection = []
      features.forEach(feature => {
        if (feature.geom) {
          collection.push({
            ...feature,
            geom: feature.geom,
          })
        }
      })
      const featureCollection = turf.featureCollection(collection.map(f => turf.feature(f.geom, { color: f.html_color, id: f.id }, { id: f.id })))
      return featureCollection
    }
  }

  resetFeatures = (featureCollection) => {
    this.state.features.forEach(feature => {
      this.map.data.remove(feature)
    })
    const features = this.map.data.addGeoJson(featureCollection)
    this.setState({ features: [...features] })
  }

  isFeature = (feature) => feature instanceof window.google.maps.Data.Feature
}

export default withScriptjs(withGoogleMap(MarketsMap))
