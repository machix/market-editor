import React, { Component } from 'react'
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  InfoWindow,
  Polygon,
} from 'react-google-maps'
import { isEmpty, find } from 'lodash'
import * as turf from '@turf/turf'
import DrawingManager from 'react-google-maps/lib/components/drawing/DrawingManager'
import { MAP } from 'react-google-maps/lib/constants'
import DistrictEditWindow from '../DistrictEditWindow'

class MarketsMap extends Component {
  constructor(props) {
    super(props)
    this.initialState = {
      infoWindow: {
        editing: false,
        show: false,
        lat: null,
        lng: null,
      },
      oldGeometry: null,
      features: [],
      selectedInstance: null,
      subRegions: [],
      newSubRegions: [],
    }

    this.state = this.initialState
  }

  componentDidMount() {
    this.map = this.mapRef.context[MAP]
    window.turf = turf
  }

  componentWillReceiveProps(nextProps) {
    const { market } = nextProps

    if (market.data && market.data.id !== this.props.market.data.id) {
      const districtsFeatureCollection = this.createFeatureCollection(market.data.districts)

      if (districtsFeatureCollection && !isEmpty((districtsFeatureCollection))) {
        this.resetFeatures(districtsFeatureCollection)

        this.map.data.setStyle((feature) => {
          return {
            fillColor: feature.getProperty('color'),
            fillOpacity: 0.5,
            strokeColor: feature.getProperty('color'),
          }
        })

        this.map.data.addListener('click', (event) => {
          const { selectedInstance, infoWindow } = this.state
          const feature = event.feature
          if (selectedInstance && (feature.getProperty('id') !== selectedInstance.getProperty('id'))) {
            if (infoWindow.editing) {
              this.handleCancel()
            }
            this.setState({
              selectedInstance: feature,
              infoWindow: {
                ...this.state.infoWindow,
                show: true,
                editing: false,
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              }
            })
          } else {
            this.setState({
              selectedInstance: feature,
              infoWindow: {
                ...this.state.infoWindow,
                show: true,
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              }
            })
          }
        })

        this.map.data.addListener('mouseup', (event) => {
          const { infoWindow } = this.state
          if (infoWindow.editing) {
            this.setState({
              infoWindow: {
                ...infoWindow,
                show: true,
                lat: event.latLng.lat(),
                lng: event.latLng.lng(),
              }
            })
          }
        })
      }
    }
  }

  render() {
    const { center } = this.props

    const {
      infoWindow,
      subRegions,
    } = this.state

    const FILL_CAPACITY = 0.6
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
              fillOpacity: FILL_CAPACITY,
              strokeOpacity: STROKE_CAPACITY,
            },
          }}
          onPolygonComplete={this.handlePolygonComplete}
        />
        { subRegions.map((subRegion, index) => {
            return (
              <Polygon
                key={index}
                editable={true}
                options={{
                  strokeColor: subRegion.htmlColor,
                  strokeOpacity: STROKE_CAPACITY,
                  fillColor: subRegion.htmlColor,
                  fillOpacity: FILL_CAPACITY,
                }}
                paths={subRegion.polygon.getPath().getArray()}
              />
            )
          })
        }
        {infoWindow.show ?
          <InfoWindow
            position={{ lat: infoWindow.lat, lng: infoWindow.lng }}
            zIndex={1}
            onCloseClick={this.handleInfoWindowCloseClick}
          >
            {this.renderInfoWindowContent()}
          </InfoWindow>
          : null
        }
      </GoogleMap>
    )
  }

  renderInfoWindowContent = () => {
    const { selectedInstance, infoWindow } = this.state
    const { market } = this.props
    const districtId = selectedInstance.getProperty('id')
    const district = find(market.data.districts, ['id', districtId])

    return (
      <DistrictEditWindow
        editing={infoWindow.editing}
        handleEdit={this.handleEdit}
        handleCancel={this.handleCancel}
        handleSave={this.handleSave}
        handleDelete={this.handleDelete}
        district={district}
      />
    )
  }

  resetState = () => {
    this.setState(this.initialState)
  }

  handleInfoWindowCloseClick = () => {
    this.setState({
      infoWindow: { ...this.state.infoWindow, show: false }
    })
  }

  handlePolygonComplete = (polygon) => {
    const htmlColor = '#'+(Math.random()*0xFFFFFF<<0).toString(16)
    polygon.setOptions({
      fillColor: htmlColor,
      strokeColor: htmlColor,
    })

    const newSubRegion = {
      htmlColor,
      polygon,
    }
    const newSubRegions = this.state.newSubRegions
    newSubRegions.push(newSubRegion)
    this.setState({ newSubRegions })
    this.showPolygonInfoWindow(polygon)

    window.google.maps.event.addListener(polygon, 'mousedown', (e) => {
      console.log('polygon clicked', e);
      this.showPolygonInfoWindow(polygon)
    })
  }

  showPolygonInfoWindow = (polygon) => {
    const polygonCenter = this.getPolygonCenter(polygon)
    this.setState({
      infoWindow: {
        ...this.state.infoWindow,
        show: true,
        lat: polygonCenter.lat(),
        lng: polygonCenter.lng(),
      },
      selectedInstance: polygon,
    })
  }

  handleEdit = () => {
      const { selectedInstance } = this.state
      this.setState({
        infoWindow: {
          ...this.state.infoWindow,
          editing: true,
        },
      })
      if (selectedInstance instanceof window.google.maps.Data.Feature) {
        this.map.data.overrideStyle(selectedInstance, { editable: true, draggable: true })
        this.setState({ oldGeometry: selectedInstance.getGeometry() })
      }
  }

  handleCancel = () => {
    const { selectedInstance } = this.state
    if (selectedInstance instanceof window.google.maps.Data.Feature) {
      this.map.data.overrideStyle(selectedInstance, { editable: false, draggable: false })
      selectedInstance.setGeometry(this.state.oldGeometry)
    }
    this.setState({
      infoWindow: {
        ...this.state.infoWindow,
        editing: false,
        show: false,
      }
    })
  }

  handleSave = () => {
    const { selectedInstance } = this.state
    if (selectedInstance instanceof window.google.maps.Data.Feature) {
      this.map.data.overrideStyle(selectedInstance, { editable: false, draggable: false })
      this.map.data.toGeoJson((geoJsonCollection) => {
        const currentFeature = find(geoJsonCollection.features, ['properties.id', selectedInstance.getProperty('id')])
        window.f = currentFeature
        window.s = selectedInstance
        window.c = geoJsonCollection
        turf.featureEach(geoJsonCollection, (feature) => {
          // if (turf.getType(feature) === 'Polygon' && turf.booleanOverlap(currentFeature, feature)) {
          //   const difference = turf.difference(currentFeature, feature)
          //   // this.map.data.addGeoJson(difference)
          //   // here create a Polygon object with new google.maps.LatLng(-34.397, 150.644) and use setGeometry
          //   const coordinates = []
          //   difference.geometry.coordinates.forEach(coord => {
          //     coordinates.push(new window.google.maps.LatLng(coord[1], coord[0]))
          //   })
          //   const polygon = new window.google.maps.Polygon({
          //     paths: coordinates,
          //   })
          //   this.selectedInstance.setGeometry(polygon)
          // }
        })
      })
    }
    this.setState({
      infoWindow: {
        ...this.state.infoWindow,
        editing: false,
        show: false,
      }
    })
  }

  handleDelete = () => {
    const { selectedInstance, infoWindow } = this.state

    if (selectedInstance instanceof window.google.maps.Data.Feature) {
      this.map.data.remove(selectedInstance)
    }

    this.setState({
      infoWindow: { ...infoWindow, show: false },
    })
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
      const featureCollection = turf.featureCollection(collection.map(f => turf.feature(f.geom, { color: f.html_color, id: f.id })))
      return featureCollection
    }
  }

  toggleInfoWindow = () => {
    this.setState({
      infoWindow: {
        ...this.state.infoWindow,
        show: !this.state.infoWindow.show,
      }
    })
  }

  resetFeatures = (featureCollection) => {
    this.state.features.forEach(feature => {
      this.map.data.remove(feature)
    })
    const features = this.map.data.addGeoJson(featureCollection)
    this.setState({ features: [...features] })
  }
}

export default withScriptjs(withGoogleMap(MarketsMap))
