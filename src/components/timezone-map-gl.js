import React, {Component} from 'react'
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { compose, withProps, defaultProps } from 'recompose';
import { fromJS } from 'immutable';
import MapGL, { NavigationControl } from 'react-map-gl';
import DeckGL, { GeoJsonLayer } from 'deck.gl';
import { DateTime, Info } from 'luxon';
import MAP_STYLE from './basic-v9.json';
import { withSource } from './context';
import time_zoneParser from '../utils/time_zoneParser';

const findLayer = id => fromJS(MAP_STYLE).get('layers').findIndex(layer => layer.get('id') === id)
const FIND_NE_FILL_LAYER = findLayer('timezone-fill');


const Tooltip = styled.div`
  position: absolute;
  padding: 4px 16px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 16px;
  z-index: 10;
  pointer-events: none;
`;
const NavigationControlWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px;
`;

class TimezoneMapGL extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredFeature: null,
      neTimeZoneFeature: null,
      lngLat: null,
      mapStyle: this.props.defaultMapStyle,
      viewport: {
        width: 1030,
        height: 750,
        latitude: 0,
        longitude: 0,
        zoom: 1,
        bearing: 0,
        pitch: 0,
        ...this.props.defaultViewport,
      },
    };
  }

  updateViewport = (viewport) => {
    this.setState({ viewport });
  }

  handleMouseOut = () => this.setState({ hoveredFeature: null, neTimeZoneFeature: null, lngLat: null })

  handleHover = event => {
    if(this.updating) {
      return ;
    }
    const { features, lngLat, srcEvent: { offsetX, offsetY }} = event;
    const { mapStyle } = this.state;

    const hoveredFeature = features && features.find(f => f.layer.id === 'timezone-boundary-builder-fill');
    let neTimeZoneFeature
    if (!hoveredFeature) {
      neTimeZoneFeature = features && features.find(f => f.layer.id === 'timezone-fill');
    }

    const newState = {};
    let newMapStyle = mapStyle;
    if(hoveredFeature) {
      newState.hoveredFeature = hoveredFeature;
      newState.neTimeZoneFeature = null;
    } else if (neTimeZoneFeature) {
      newState.neTimeZoneFeature = neTimeZoneFeature;
      newState.hoveredFeature = null;
      newMapStyle = newMapStyle.setIn(['layers', FIND_NE_FILL_LAYER, 'paint', 'fill-opacity', 1, 1, 2], neTimeZoneFeature.properties.objectid);
    }
    this.updating = true;
    this.setState({
      lngLat,
      x: offsetX,
      y: offsetY,
      mapStyle: newMapStyle,
      ...newState,
    }, () => {
      this.updating = false;
    });
  };

  handleClick = (event) => {
    const { onTimezoneClick } = this.props;
    const { hoveredFeature } = this.state;
    const tzid = hoveredFeature && hoveredFeature.properties && hoveredFeature.properties.tzid

    if (onTimezoneClick && tzid) {
      onTimezoneClick(event, tzid);
    }
  }

  renderTooltip() {
    const { x, y, hoveredFeature, lngLat, viewport } = this.state;
    const { source } = this.props;

    if(!hoveredFeature || !lngLat) return null;
    const data =
      source.timezoneBoundaryBuilder.features.find(
        feature => feature.properties.tzid === hoveredFeature.properties.tzid
      )

    const layer = new GeoJsonLayer({
      id: 'geojson-layer',
      data,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [129, 69, 46, 120],
      getRadius: 100,
      getLineWidth: 1,
      getElevation: 30,
    });
    const dt = DateTime.local().setZone(hoveredFeature.properties.tzid);

    return (
      <React.Fragment>

        <DeckGL {...viewport} layers={[layer]}/>
        <Tooltip style={{top: y, left: x}}>
          <p>
            {dt.offsetNameLong} ({dt.offsetNameShort})
          </p>
          <p>
            {dt.zoneName}
          </p>
          <p>
            {DateTime.local().setZone(hoveredFeature.properties.tzid).toLocaleString({
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </Tooltip>
      </React.Fragment>
    );
  }

  renderNeTooltip() {
    const { x, y, neTimeZoneFeature, lngLat } = this.state;

    if(!neTimeZoneFeature || !lngLat) return null;
    var dt = DateTime.local().setZone(time_zoneParser(neTimeZoneFeature.properties.time_zone), { keepLocalTime: false })
    return (
      neTimeZoneFeature && (
        <Tooltip style={{ top: y, left: x }}>
          <p>
            {dt.offsetNameLong}{' '}
            ({ dt.zoneName })
          </p>
          <p>
            {dt.toLocaleString({
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </Tooltip>
      )
    );
  }

  renderSelectTimezone() {
    const { source, timezone } = this.props;
    const { viewport } = this.state;
    if(!timezone) return null;

    let data;
    if (Info.isValidIANAZone(timezone)) {
      data = source.timezoneBoundaryBuilder.features.find(
        feature => feature.properties.tzid === timezone
      )
    } else {
      return null;
    }

    const layer = new GeoJsonLayer({
      id: 'select-timezone-layer',
      data,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [0, 0, 0, 190],
      getRadius: 100,
      getLineWidth: 1,
      getElevation: 30,
    });

    return (
      <DeckGL {...viewport} layers={[layer]}/>
    );
  }

  render() {
    const { mapboxApiAccessToken } = this.props;
    const { mapStyle, viewport } = this.state;

    return (
      <div
        onClick={this.handleClick}
        onMouseOut={this.handleMouseOut}
      >
        <MapGL
          { ...viewport }
          minZoom={1}
          maxZoom={6}
          mapStyle={mapStyle}
          onHover={this.handleHover}
          onViewportChange={this.updateViewport}
          mapboxApiAccessToken={mapboxApiAccessToken}
          doubleClickZoom={false}
        >
          {this.renderTooltip()}
          {this.renderNeTooltip()}
          {this.renderSelectTimezone()}
          <NavigationControlWrapper>
            <NavigationControl onViewportChange={this.updateViewport} />
          </NavigationControlWrapper>
        </MapGL>
      </div>

    );
  }
}

TimezoneMapGL.propTypes = {
  defaultMapStyle: PropTypes.object,
  defaultViewport: PropTypes.object,
  mapboxApiAccessToken: PropTypes.string.isRequired,
  timezone: PropTypes.string,
  onTimezoneClick: PropTypes.func,
};

TimezoneMapGL.defaultProps = {
  timezone: null,
  defaultViewport: {
    width: 1030,
    height: 750,
    latitude: 0,
    longitude: 0,
    zoom: 1,
    bearing: 0,
    pitch: 0,
  }
}

export default compose(
  withSource,
  defaultProps({
    defaultMapStyle: fromJS(MAP_STYLE)
  }),
  withProps(({ source, defaultMapStyle }) => {
    return {
      defaultMapStyle: defaultMapStyle
        .setIn(
          ['sources', 'timezone-source'],
          fromJS({
            type: 'geojson',
            data: source.naturalEarth,
          }),
        )
        .setIn(
          ['sources', 'timezone-boundary-builder'],
          fromJS({
            type: 'geojson',
            data: source.timezoneBoundaryBuilder
          })
        ),
    };
  })
)(TimezoneMapGL)
