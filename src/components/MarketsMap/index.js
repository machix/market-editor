import React, { Component } from 'react'
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
} from 'react-google-maps'
import { isEmpty, find, remove } from 'lodash'
import * as turf from '@turf/turf'
import DrawingManager from 'react-google-maps/lib/components/drawing/DrawingManager'
import { MAP } from 'react-google-maps/lib/constants'
import randomColor from 'random-color'

class MarketsMap extends Component {
  constructor(props) {
    super(props)
    this.initialState = {
      oldGeometry: null,
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
          const { selectedFeature } = this.state
          const feature = event.feature
          if (!this.props.selectedRegion) {
            this.handleClickFeature(feature)
          }
          if (selectedFeature && (selectedFeature.getProperty('id') !== feature.getProperty('id'))) {
            this.clearSelection()
            this.handleClickFeature(feature)
          }
        })
      }

      this.map.addListener('click', () => {
        this.clearSelection()
        this.props.handleCancelDone({ closeInfoWindow: true })
      })
    }

    // Selected Region Changed
    if (selectedRegion && (selectedRegion !== this.props.selectedRegion)) {
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

      let newFeature = this.map.data.getFeatureById(selectedRegion)
      let region

      if (selectedTool === 'districtEditor') {
        region = find(market.data.districts, ['id', selectedRegion])
      } else {
        region = find(market.data.starting_points, ['id', selectedRegion])
      }

      if (region && !region.geom) {
        // Clear old temp polygon first
        if (selectedFeature && this.isFeature(selectedFeature)) {
          if (selectedFeature.getProperty('isTemp')) {
            selectedFeature.setProperty('isTemp', false)
            this.map.data.remove(selectedFeature)
          }
        }
        const center = this.map.getCenter()
        const h = 0.1
        const w = 0.075
        const coordinates = [
          { lat: center.lat() + w, lng: center.lng() + h },
          { lat: center.lat() + w, lng: center.lng() - h },
          { lat: center.lat() - w, lng: center.lng() - h },
          { lat: center.lat() - w, lng: center.lng() + h },
          { lat: center.lat() + w, lng: center.lng() + h },
        ]
        const polygon = new window.google.maps.Data.Polygon([[...coordinates]])
        newFeature = this.map.data.add({
          geometry: polygon,
          idPropertyName: 'id',
          properties: {
            id: region.id,
            isTemp: true,
            color: randomColor().hexString(),
          }
        })
      }
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
      this.props.handleClickFeature()
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
        if (selectedFeature.getProperty('isTemp')) {
          selectedFeature.setProperty('isTemp', false)
          this.map.data.remove(selectedFeature)
        }
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
    if (polygon.getPaths().getAt(0).getArray().length < 4) {
      this.props.notify({
        message: 'Polygon must have at least 4 positions.',
        status: 'error',
        position: 'tc',
      })
      polygon.setMap(null)
      return
    }
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

    // Editing Existing Region
    if (this.isFeature(selectedFeature)) {
      selectedFeature.setProperty('isTemp', false)
      this.map.data.overrideStyle(selectedFeature, { editable: false, draggable: false })
      let result
      try {
        result = this.resolveFeatureCollision(selectedFeature)
      } catch (e) {
        this.props.notify({
          message: e.message,
          status: 'error',
          position: 'tc',
        })
        this.handleCancel()
        this.props.handleSaveDone()
        return
      }
      const payload = {
        ...formData,
        geom: result.geometry,
        html_color:  result.properties.color,
      }
      if (selectedTool === 'districtEditor') {
        this.props.updateDistrict(selectedRegion, payload).then((response) => {
          this.props.handleSaveDone(response)
        })
      } else {
        this.props.updateStartingPoint(selectedRegion, payload).then((response) => {
          this.props.handleSaveDone(response)
        })
      }
    } else {
      // Create New Region
      const newPolygon = this.map.data.add({
        geometry: new window.google.maps.Data.Polygon([selectedFeature.getPaths().getAt(0).getArray()]),
        properties: { color: selectedFeature.fillColor, id: 0 },
        idPropertyName: 'id',
      })
      this.map.data.overrideStyle(newPolygon, {
        editable: false,
        draggable: false,
        fillColor: selectedFeature.fillColor,
        strokeColor: selectedFeature.fillColor,
        fillOpacity: selectedFeature.fillOpacity,
      })
      let result
      try {
        result = this.resolveFeatureCollision(selectedFeature, newPolygon)
      } catch (e) {
        this.props.notify({
          message: e.message,
          status: 'error',
          position: 'tc',
        })
        selectedFeature.setMap(null)
        this.map.data.remove(newPolygon)
        this.props.handleSaveDone()
        return
      }
      selectedFeature.setMap(null)
      const payload = {
        ...formData,
        geom: result.geometry,
        html_color:  result.properties.color,
      }
      if (selectedTool === 'districtEditor') {
        this.props.createDistrict(payload).then((response) => {
          if (response.error) {
            this.map.data.remove(newPolygon)
          } else {
            newPolygon.setProperty('id', response.payload.data.id)
            this.map.data.overrideStyle(newPolygon, {
              strokeColor: newPolygon.getProperty('color'),
              strokeWeight: 2,
              zIndex: 1,
            })
            this.setState({ selectedFeature: newPolygon })
          }
          this.props.handleSaveDone(response)
        })
      } else {
        this.props.createStartingPoint(payload).then((response) => {
          if (response.error) {
            this.map.data.remove(newPolygon)
          } else {
            newPolygon.setProperty('id', response.payload.data.id)
            this.map.data.overrideStyle(newPolygon, {
              strokeColor: newPolygon.getProperty('color'),
              strokeWeight: 2,
              zIndex: 1,
            })
            this.setState({ selectedFeature: newPolygon })
          }
          this.props.handleSaveDone(response)
        })
      }
    }
  }

  resolveFeatureCollision = (selectedFeature, newPolygon) => {
    let currentFeature, difference
    this.map.data.toGeoJson((geoJsonCollection) => {
      let newGeoJsonPolygon
      if (newPolygon) {
        newGeoJsonPolygon = this.toGeoJsonPolygon(newPolygon)
      }
      currentFeature = newGeoJsonPolygon ? newGeoJsonPolygon : find(geoJsonCollection.features, ['properties.id', selectedFeature.getProperty('id')])
      remove(geoJsonCollection.features, f => ((f.id === currentFeature.id) || (f.properties.id === currentFeature.properties.id) || (f.properties.color === currentFeature.properties.color)))
      const union = turf.union(...geoJsonCollection.features)
      const unionPolygons = this.toPolygons(union)
      difference = currentFeature
      unionPolygons.forEach((polygon) => {
        if (turf.getType(polygon) === 'Polygon') {
          if (turf.booleanContains(polygon, currentFeature)) {
            throw new Error('Polygon must not be contained within another polygon.')
          }
          if (turf.booleanOverlap(difference, polygon)) {
            difference = turf.difference(difference, polygon)
          }
        }
      })
      if (difference !== currentFeature) {
        const newDataPolygon = this.toDataPolygon(difference)
        if (this.isFeature(selectedFeature)) {
          selectedFeature.setGeometry(newDataPolygon)
        } else {
          newPolygon.setGeometry(newDataPolygon)
        }
      }
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
    this.map.data.forEach(feature => {
      this.map.data.remove(feature)
    })
    this.map.data.addGeoJson(featureCollection)
  }

  isFeature = (feature) => feature instanceof window.google.maps.Data.Feature

  toGeoJsonPolygon = (feature) => {
    let coordinates = []
    if (this.isFeature(feature)) {
      const paths = feature.getGeometry().getAt(0).getArray()
      paths.forEach(coord => {
        coordinates.push([coord.lng(), coord.lat()])
      })
      coordinates = [...coordinates, [...coordinates[0]]]
    }
    return turf.polygon([[...coordinates]], { color: feature.getProperty('color') })
  }

  toDataPolygon = (geoJson) => {
    const coordinates = []
    geoJson.geometry.coordinates[0].forEach(coord => {
      coordinates.push(new window.google.maps.LatLng(coord[1], coord[0]))
    })
    return new window.google.maps.Data.Polygon([[...coordinates]])
  }

  toPolygons = (multiPolygon) => {
    const polygons = []
    multiPolygon.geometry.coordinates.forEach(coords => {
      const coordinates = turf.getType(multiPolygon) === 'MultiPolygon' ? coords : [coords]
      polygons.push({ type: 'Polygon', coordinates })
    })
    return polygons
  }
}

export default withScriptjs(withGoogleMap(MarketsMap))
