import React, { Component } from 'react'
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  InfoWindow,
  Polygon,
} from 'react-google-maps'
import DrawingManager from 'react-google-maps/lib/components/drawing/DrawingManager'


const InfoWindowContent = ({ editMode, onEdit, onDelete }) => {
  return (
    <div>
      { editMode
        ? <div>
            <input />
            <button type="button">Save</button>
            <button type="button">Cancel</button>
          </div>
        : <h3>Presidio</h3>
      }
      <div>
        <span>1,000 sq mi </span>
        <span>30 mi</span>
      </div>
      <div>
        <span
          onClick={onEdit}
        >
          edit
        </span>
        <span
          onClick={onDelete}
        >
          delete
        </span>
      </div>
    </div>
  )
}


class DistrictsMap extends Component {
  constructor() {
    super()
    this.mapRef = React.createRef()
    this.initialState = {
      infoWindowEditMode: false,
      showInfoWindow: false,
      infoWindowLat: null,
      infoWindowLng: null,
      selectedPolygon: null,
      subRegions: [],
      newSubRegions: [],
    }

    this.state = this.initialState
  }

  componentDidMount() {
    const presidioCoords = [
      {lng: -122.4879999999589018, lat: 37.7920000000127700},
      {lng: -122.4879999999589018, lat: 37.7990000000127679},
      {lng: -122.4879999999589018, lat: 37.8060000000127658},
      {lng: -122.4809999999588968, lat: 37.8060000000127658},
      {lng: -122.4669999999588867, lat: 37.8130000000127637},
      {lng: -122.4599999999588817, lat: 37.8130000000127637},
      {lng: -122.4529999999588767, lat: 37.8130000000127637},
      {lng: -122.4459999999588717, lat: 37.8130000000127637},
      {lng: -122.4459999999588717, lat: 37.8060000000127658},
      {lng: -122.4459999999588717, lat: 37.7990000000127679},
      {lng: -122.4459999999588717, lat: 37.7920000000127700},
      {lng: -122.4529999999588767, lat: 37.7920000000127700},
      {lng: -122.4599999999588817, lat: 37.7920000000127700},
      {lng: -122.4669999999588867, lat: 37.7920000000127700},
      {lng: -122.4739999999588917, lat: 37.7920000000127700},
      {lng: -122.4809999999588968, lat: 37.7920000000127700},
      {lng: -122.4879999999589018, lat: 37.7920000000127700},
    ]
    const htmlColor = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
    const polygon = new window.google.maps.Polygon({
      paths: presidioCoords,
      strokeColor: htmlColor,
      strokeOpacity: 1,
      fillColor: htmlColor,
      fillOpacity: 0.75,
    })

    const subRegion = {
      polygon,
      htmlColor,
    }

    const subRegions = this.state.subRegions
    subRegions.push(subRegion)
    this.setState({ subRegions })
  }

  render() {
    const {
      infoWindowEditMode,
      showInfoWindow,
      infoWindowLat,
      infoWindowLng,
      subRegions,
    } = this.state

    const FILL_CAPACITY = 0.75
    const STROKE_CAPACITY = 1

    return (
      <div className="App">
        <GoogleMap
          ref={this.mapRef}
          defaultZoom={13}
          defaultCenter={{ lat: 37.7833918, lng: -122.4102013 }}
        >
          <DrawingManager
            defaultDrawingMode={window.google.maps.drawing.OverlayType.POLYGON}
            defaultOptions={{
              drawingControl: true,
              drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                  window.google.maps.drawing.OverlayType.POLYGON,
                  window.google.maps.drawing.OverlayType.RECTANGLE,
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
          { showInfoWindow
            ? <InfoWindow
                position={{ lat: infoWindowLat, lng: infoWindowLng }}
                zIndex={1}
                onCloseClick={this.handleInfoWindowCloseClick}
              >
                <InfoWindowContent
                  editMode={infoWindowEditMode}
                  onEdit={this.handleEditPolygon}
                  onDelete={this.handleDeletePolygon}
                />
              </InfoWindow>
            : null
          }
        </GoogleMap>
      </div>
    );
  }

  resetState = () => {
    this.setState(this.initialState)
  }

  handleInfoWindowCloseClick = () => {
    this.setState({
      showInfoWindow: false,
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
    // const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath())
    // const length = window.google.maps.geometry.spherical.computeLength(polygon.getPath())
    // const coordinates = polygon.getPath().getArray()
    // polygon.getPath().forEach((coordinate) => {
    //   console.log(coordinate.toString());
    // })
    // console.log('', coordinates[0].lat());
  }

  showPolygonInfoWindow = (polygon) => {
    const polygonCenter = this.getPolygonCenter(polygon)
    this.setState({
      showInfoWindow: true,
      selectedPolygon: polygon,
      infoWindowLat: polygonCenter.lat(),
      infoWindowLng: polygonCenter.lng(),
    })
  }

  handleEditPolygon = () => {
    this.setState({
      infoWindowEditMode: true,
    })
  }

  handleDeletePolygon = () => {
    const { selectedPolygon } = this.state
    selectedPolygon.setMap(null)
    this.setState({
      showInfoWindow: false,
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
}

export default withScriptjs(withGoogleMap(DistrictsMap))
