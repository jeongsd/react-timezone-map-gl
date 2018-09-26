import React, {Component} from 'react'
import { fromJS } from 'immutable';
import MapGL, { Marker, NavigationControl } from 'react-map-gl';
import momentTimezone from 'moment-timezone/data/meta/latest.json'
import TimezoneMarkIcon from './TimezoneMarkIcon';
import neTimezone from '../data/neTimezone.json';
import tzbbJSON from '../data/timezone-boundary-builder.json';
import MAP_STYLE from './basic-v9.json';


let defaultMapStyle = fromJS(MAP_STYLE);
defaultMapStyle = defaultMapStyle
  .setIn(['sources', 'timezone-source'], fromJS({ type: 'geojson', data: neTimezone }))
  .setIn(['sources', 'timezone-boundary-builder'], fromJS({ type: 'geojson', data: tzbbJSON }))


const OVERLAYS_CLASSNAME = 'overlays';

export const highlightLayerIndex = defaultMapStyle.get('layers').findIndex(layer => layer.get('id') === 'timezone-boundary-builder-fill')
const zoneKeys = Object.keys(momentTimezone.zones);
export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredFeature: null,
      lngLat: null,
      mapStyle: defaultMapStyle,
      viewport: {
        width: 1030,
        height: 750,
        latitude: -20,
        longitude: 0,
        zoom: 1,
        bearing: 0,
        pitch: 0
      },
    };
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.selectTimezone !== this.props.selectTimezone) {
      this.setState({
        mapStyle: defaultMapStyle.setIn(['layers', highlightLayerIndex, 'paint', 'fill-opacity', 1, 1, 2], this.props.selectTimezone),
      });
    }
  }


  _updateViewport = (viewport) => {
    this.setState({viewport});
  }

  _renderLayers() {
    // const {data = DATA_URL} = this.props;

    return [
    ];
  }

  _onHover = event => {
    const { features, target, lngLat, srcEvent: { offsetX, offsetY }} = event;
    if (target.className !== OVERLAYS_CLASSNAME) return;

    // let dist;
    // let closestDist = 100;
    // let closestTimezone;
    // for (let index = 0; index < zoneKeys.length; index++) {
    //   const zone = momentTimezone.zones[zoneKeys[index]];
    //   dist = distSqr([zone.long, zone.lat], lngLat)
    //   if (dist < closestDist) {
    //     closestTimezone = zone;
    //     closestDist = dist;
    //   }
    // }
    // console.log('closestTimezone', closestTimezone)

    const hoveredFeature = features && features.find(f => f.layer.id === 'timezone-boundary-builder-fill');


    if(!hoveredFeature) return null;
    this.setState({
      hoveredFeature,
      lngLat,
      x: offsetX,
      y: offsetY,
      mapStyle: defaultMapStyle.setIn(['layers', highlightLayerIndex, 'paint', 'fill-opacity', 1, 1, 2], hoveredFeature.properties.tzid),
    });
  };

  handleClick = (event) => {
    const { onTimezoneClick } = this.props;
    const hoverFeature = event.features && event.features.find(f => f.layer.id === 'timezone-boundary-builder-fill');

    if (onTimezoneClick && hoverFeature) {
      onTimezoneClick(event, hoverFeature.properties.tzid)
    }
  }

  _renderTooltip() {
    const { x, y, hoveredFeature, lngLat } = this.state;

    if(!hoveredFeature && !lngLat) return null;

    return (
      hoveredFeature && (
        <div className="tooltip" style={{top: y, left: x}}>
          <p>
            {hoveredFeature.properties.tzid}
          </p>
        </div>
      )
    );
  }

  renderMaker() {
    const { selectTimezone } = this.props;

    const timezoneMeta = selectTimezone && momentTimezone.zones[selectTimezone];
    if (!timezoneMeta) return null;
    return (
      <Marker
        longitude={timezoneMeta.long}
        latitude={timezoneMeta.lat}
        offsetLeft={-10}
        offsetTop={-13}
      >
        <TimezoneMarkIcon />
      </Marker>
    );
  }

  renderTimezoneCities() {
    return zoneKeys.map(zoneKey => {

      const timezoneMeta = momentTimezone.zones[zoneKey];
      return (
        <Marker
          key={zoneKey}
          longitude={timezoneMeta.long}
          latitude={timezoneMeta.lat}
        >
          {timezoneMeta.name}
        </Marker>
      )
    });
  }

  render() {
    const { mapboxApiAccessToken, selectTimezone } = this.props;
    const { mapStyle, viewport } = this.state;

    return (
      <MapGL
        { ...viewport }
        minZoom={1}
        maxZoom={5}
        mapStyle={mapStyle}
        onHover={this._onHover}
        onClick={this.handleClick}
        onViewportChange={this._updateViewport}
        mapboxApiAccessToken={mapboxApiAccessToken}
      >
        {this._renderTooltip()}
        {/* {this.renderMaker()} */}

        <div className="navigationControlWrapper">
          <NavigationControl onViewportChange={this._updateViewport} />
        </div>
      </MapGL>
    );
  }
}
