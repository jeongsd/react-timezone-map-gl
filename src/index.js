import React, {Component} from 'react'
import { fromJS } from 'immutable';
import MapGL, { Marker, NavigationControl } from 'react-map-gl';
// import geojsonMerge from '@mapbox/geojson-merge';
import DeckGL, { GeoJsonLayer, LineLayer } from 'deck.gl';
import ts from '@mapbox/timespace';
import timespaceTimezone from '@mapbox/timespace/lib/timezones.json';
import tilebelt from '@mapbox/tilebelt';
import { scaleThreshold } from 'd3-scale';
import groupBy from 'lodash/groupBy';
import reduce from 'lodash/reduce';
import momentTimezone from 'moment-timezone/data/meta/latest.json'
import TimezoneMarkIcon from './TimezoneMarkIcon';
import timezoneCitiesJSON from '../data/timezoneCities.json';
import neTimezone from '../data/neTimezone.json';
import MAP_STYLE from './basic-v9.json';


// console.log('timezoneCitiesJSON', timezoneCitiesJSON)
let defaultMapStyle = fromJS(MAP_STYLE);
defaultMapStyle = defaultMapStyle
  .setIn(['sources', 'timezone-source'], fromJS({ type: 'geojson', data: neTimezone }))
  .setIn(['sources', 'timezone-cities'], fromJS({ type: 'geojson', data: timezoneCitiesJSON }))
// defaultMapStyle = defaultMapStyle


const OVERLAYS_CLASSNAME = 'overlays';

export const highlightLayerIndex = defaultMapStyle.get('layers').findIndex(layer => layer.get('id') === 'timezone-fill')
const zoneKeys = Object.keys(momentTimezone.zones);

const newData = reduce(timespaceTimezone, (result, tz, tilePoint) => {
  if(result[tz]) {
    result[tz] = [...result[tz], tilePoint];
  } else {
    result[tz] = [tilePoint];
  }
  return result;
}, {})

// const keys = Object.keys(timespaceTimezone)
// for (let index = 0; index < keys.length; index++) {
//   const key = keys[index];

// }
// console.log(newData)
// const timezoneTile = groupBy(timespaceTimezone, tzName => tzName)
// console.log(timezoneTile);

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

    const hoveredFeature = features && features.find(f => f.layer.id === 'timezone-fill');
    const countryFeature = features && features.find(f => f.layer.id === 'admin_country');
    this.setState({
      hoveredFeature,
      lngLat,
      x: offsetX,
      y: offsetY,
      mapStyle: defaultMapStyle.setIn(['layers', highlightLayerIndex, 'paint', 'fill-opacity', 1, 1, 2], hoveredFeature.properties.objectid),
    });
  };

  handleClick = (event) => {
    // console.log('handleClick')
    const { onTimezoneClick } = this.props;
    const hoverFeature = event.features && event.features.find(f => f.layer.id === 'timezone-fill');
    const time = ts.getFuzzyLocalTimeFromPoint(Date.now(), event.lngLat);

    if (onTimezoneClick && time) {
      onTimezoneClick(event, time.tz())
    }
    // console.log(timespaceTimezone);
    // console.log(time.tz());
    // console.log(time);

    //
    // console.log(event.features);
  }

  _renderTooltip() {
    const { x, y, hoveredFeature, lngLat } = this.state;
    if(!hoveredFeature && !lngLat) return null;
    var time = ts.getFuzzyLocalTimeFromPoint(Date.now(), lngLat);

    return (
      hoveredFeature && (
        <div className="tooltip" style={{top: y, left: x}}>
          <p>
            {(time && time.tz()) || hoveredFeature.properties.tz_name1st}
          </p>
          <p>
            {hoveredFeature.properties.utc_format}
          </p>
          <p>
            {hoveredFeature.properties.time_zone}
          </p>
        </div>
      )
    );
  }

  renderMaker() {
    const { selectTimezone } = this.props;

    // console.log();

    // if(selectTimezone) {
    //   // console.log(selectTimezone);
    //   // const tilePonewData = newData[selectTimezone].map(tilePoint => tilebelt.tileToGeoJSON(tilePoint.split('/')))
    //   // tileToGeoJSON()
    //   https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_time_zones.zip
    //   // var mergedGeoJSON = geojsonMerge.merge(tilePonewData);
    //   // console.log(mergedGeoJSON)
    //   // const a = tilebelt.getParent()
    //   // console.log(timezoneTile[selectTimezone])
    //   // console.log(a);
    // }

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
        {/* <CityPin size={20} onClick={() => this.setState({popupInfo: city})} /> */}
      </Marker>
    );
  }

  renderTimezoneCities() {
    // const { selectTimezone } = this.props;
    // const timezoneMeta = selectTimezone && momentTimezone.zones[selectTimezone];
    // if (!timezoneMeta) return null;
    // console.log(momentTimezone)
    return zoneKeys.map(zoneKey => {

      const timezoneMeta = momentTimezone.zones[zoneKey];
      // console.log(timezoneMeta.long)
      return (
        <Marker
          key={zoneKey}
          longitude={timezoneMeta.long}
          latitude={timezoneMeta.lat}
        >
          {timezoneMeta.name}
          {/* <TimezoneMarkIcon /> */}
          {/* <CityPin size={20} onClick={() => this.setState({popupInfo: city})} /> */}
        </Marker>
      )
    });
  }

  render() {
    // const {viewState, controller = true, baseMap = true} = this.props;
    const { mapboxApiAccessToken, selectTimezone } = this.props;
    // const {viewport} = this.state;
    const { mapStyle, viewport } = this.state;
    // timezoneMeta

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
        // preventStyleDiffing={ false }
      >
        {/* {this.renderTimezoneCities()} */}
        {this._renderTooltip()}
        {this.renderMaker()}

        <div className="navigationControlWrapper">
          <NavigationControl onViewportChange={this._updateViewport} />
        </div>
      </MapGL>
    );
  }
}
