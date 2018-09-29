import React, {Component} from 'react'
import { compose, withProps, defaultProps } from 'recompose';
import { fromJS } from 'immutable';
import MapGL, { Marker, NavigationControl } from 'react-map-gl';
import momentTimezone from 'moment-timezone/data/meta/latest.json'
import { feature as topoFeature } from "topojson-client";
import TimezoneMarkIcon from './TimezoneMarkIcon';
import MAP_STYLE from './basic-v9.json';
import { withSource } from './context';

const OVERLAYS_CLASSNAME = 'overlays';

const findLayer = id => mapStyle => mapStyle.get('layers').findIndex(layer => layer.get('id') === id)
const BOUNDARY_FILL_LAYER = findLayer('timezone-boundary-builder-fill');
const BOUNDARY_SELECT_LAYER = findLayer('timezone-boundary-builder-select-fill');
const FIND_NE_FILL_LAYER = findLayer('timezone-fill');

const zoneKeys = Object.keys(momentTimezone.zones);
class TimezoneMapGL extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredFeature: null,
      lngLat: null,
      mapStyle: this.props.defaultMapStyle,
      viewport: {
        width: 1030,
        height: 750,
        latitude: -20,
        longitude: 0,
        zoom: 1,
        bearing: 0,
        pitch: 0,
        ...this.props.defaultViewport,
      },
    };
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { mapStyle } = this.state;

    if (prevProps.selectTimezone !== this.props.selectTimezone) {
      this.setState({
        mapStyle: mapStyle.setIn(['layers', BOUNDARY_SELECT_LAYER, 'paint', 'fill-opacity', 1, 1, 2], this.props.selectTimezone),
      });
    }
  }

  _updateViewport = (viewport) => {
    this.setState({viewport});
  }

  _onHover = event => {
    const { features, target, lngLat, srcEvent: { offsetX, offsetY }} = event;
    const { mapStyle } = this.state;
    if (target.className !== OVERLAYS_CLASSNAME) return;

    const hoveredFeature = features && features.find(f => f.layer.id === 'timezone-boundary-builder-fill');
    const neTimeZoneFeature = features && features.find(f => f.layer.id === 'timezone-fill');
    const newState = {};
    let newMapStyle = mapStyle;
    if(hoveredFeature) {
      newState.hoveredFeature = hoveredFeature;
      newState.neTimeZoneFeature = null;
      newMapStyle = newMapStyle.setIn(['layers', BOUNDARY_FILL_LAYER, 'paint', 'fill-opacity', 1, 1, 2], hoveredFeature.properties.tzid);
    } else if (neTimeZoneFeature) {
      newState.neTimeZoneFeature = neTimeZoneFeature;
      newState.hoveredFeature = null;
      newMapStyle = newMapStyle.setIn(['layers', FIND_NE_FILL_LAYER, 'paint', 'fill-opacity', 1, 1, 2], neTimeZoneFeature.properties.objectid);
    }

    this.setState({
      lngLat,
      x: offsetX,
      y: offsetY,
      mapStyle: newMapStyle,
      ...newState,
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

  renderNeTooltip() {
    const { x, y, neTimeZoneFeature, lngLat } = this.state;

    if(!neTimeZoneFeature && !lngLat) return null;

    return (
      neTimeZoneFeature && (
        <div className="tooltip" style={{top: y, left: x}}>
          <p>
            {neTimeZoneFeature.properties.time_zone}
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
        maxZoom={8}
        mapStyle={mapStyle}
        onHover={this._onHover}
        onClick={this.handleClick}
        onViewportChange={this._updateViewport}
        mapboxApiAccessToken={mapboxApiAccessToken}
      >
        {this._renderTooltip()}
        {this.renderNeTooltip()}
        {/* {this.renderMaker()} */}

        <div className="navigationControlWrapper">
          <NavigationControl onViewportChange={this._updateViewport} />
        </div>
      </MapGL>
    );
  }
}

export default compose(
  withSource,
  defaultProps({
    defaultMapStyle: fromJS(MAP_STYLE)
  }),
  withProps(({ source, defaultMapStyle }) => ({
    defaultMapStyle: defaultMapStyle
      .setIn(
        ['sources', 'timezone-source'],
        fromJS({
          type: 'geojson',
          data: topoFeature(source.naturalEarth, source.naturalEarth.objects.ne_10m_time_zones),
        }),
      )
      .setIn(
        ['sources', 'timezone-boundary-builder'],
        fromJS({
          type: 'geojson',
          data: topoFeature(source.timezoneBoundaryBuilder, source.timezoneBoundaryBuilder.objects.combined_shapefile)
        })
      ),
      // findBoundaryFillLayer,
  }))
)(TimezoneMapGL)

// ();
