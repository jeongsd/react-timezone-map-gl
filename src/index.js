import React, {Component} from 'react'
import { fromJS } from 'immutable';
import MapGL, { Marker } from 'react-map-gl';
// import {InteractiveMap} from 'react-map-gl';
import DeckGL, { GeoJsonLayer, LineLayer } from 'deck.gl';
import ts from '@mapbox/timespace';
import { scaleThreshold } from 'd3-scale';
import momentTimezone from 'moment-timezone/data/meta/latest.json'
// import timezone from './timezone.json';
import TimezoneMarkIcon from './TimezoneMarkIcon';
import MAP_STYLE from './basic-v9.json';
import timezone2 from './test.json';
// import bart from './bart.geo.json';

// console.log(timezone)


let defaultMapStyle = fromJS(MAP_STYLE);
defaultMapStyle = defaultMapStyle
  .setIn(['sources', 'timezone-source'], fromJS({type: 'geojson', data: timezone2 }))

export const highlightLayerIndex = defaultMapStyle.get('layers').findIndex(layer => layer.get('id') === 'timezone-fill')

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredFeature: null,
      lngLat: null,
      mapStyle: defaultMapStyle,
    };
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  _renderLayers() {
    // const {data = DATA_URL} = this.props;

    return [
    ];
  }

  _onHover = event => {
    const { features, lngLat, srcEvent: { offsetX, offsetY }} = event;

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
    const { onTimezoneClick } = this.props;
    // const hoverFeature = event.features && event.features.find(f => f.layer.id === 'timezone-fill');
    const time = ts.getFuzzyLocalTimeFromPoint(Date.now(), event.lngLat);
    if (onTimezoneClick && time) onTimezoneClick(event, time.tz())


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
    const timezoneMeta = selectTimezone && momentTimezone.zones[selectTimezone];
    if (!timezoneMeta) return null;
    return (
      <Marker
        longitude={timezoneMeta.long}
        latitude={timezoneMeta.lat}
      >
        <TimezoneMarkIcon />
        {/* <CityPin size={20} onClick={() => this.setState({popupInfo: city})} /> */}
      </Marker>
    );
  }

  render() {
    // const {viewState, controller = true, baseMap = true} = this.props;
    const { mapboxApiAccessToken, selectTimezone } = this.props;
    const { mapStyle } = this.state;

    const viewport =  {
      latitude: -20,
      longitude: 0,
      zoom: 1,
      bearing: 0,
      pitch: 0
    };


    // timezoneMeta

    return (
      <MapGL
        mapStyle={mapStyle}
        width={1030}
        height={750}
        onHover={this._onHover}
        onClick={this.handleClick}
        { ...viewport }
        mapboxApiAccessToken={mapboxApiAccessToken}
        preventStyleDiffing={ false }
      >
        {this._renderTooltip()}
        {this.renderMaker()}
      </MapGL>
    );
  }
}
