import React, {Component} from 'react'
import styled from 'styled-components';
import { compose, withProps, defaultProps } from 'recompose';
import { fromJS } from 'immutable';
import MapGL, { Marker, NavigationControl } from 'react-map-gl';
import DeckGL, { ArcLayer, GeoJsonLayer } from 'deck.gl';
// import momentTimezone from 'moment-timezone/data/meta/latest.json'
import { DateTime, IANAZone } from 'luxon';
import { normalizeZone } from 'luxon/src/impl/zoneUtil';
// /Users/jeongseongdae/Developer/github/jeongsd/react-timezone-map-gl/node_modules/.js
import MAP_STYLE from './basic-v9.json';
import { withSource } from './context';
import time_zoneParser from '../utils/time_zoneParser';

const findLayer = id => fromJS(MAP_STYLE).get('layers').findIndex(layer => layer.get('id') === id)
// const BOUNDARY_FILL_LAYER = findLayer('timezone-boundary-builder-fill');
// const BOUNDARY_SELECT_LAYER = findLayer('timezone-boundary-builder-select-fill');
const FIND_NE_FILL_LAYER = findLayer('timezone-fill');

// const zoneKeys = Object.keys(momentTimezone.zones);

const Tooltip = styled.div`
  position: absolute;
  padding: 4px 16px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  /* max-width: 300px; */
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
    this._onHover = this._onHover.bind(this);
    this._renderTooltip = this._renderTooltip.bind(this);
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   const { mapStyle } = this.state;

  //   if (prevProps.selectTimezone !== this.props.selectTimezone) {
  //     this.setState({
  //       mapStyle: mapStyle.setIn(['layers', BOUNDARY_SELECT_LAYER, 'paint', 'fill-opacity', 1, 1, 2], this.props.selectTimezone),
  //     });
  //   }
  // }

  _updateViewport = (viewport) => {
    this.setState({viewport});
  }

  _onHover = event => {
    if(this.updating) {
      return ;
    }
    const { features, target, lngLat, srcEvent: { offsetX, offsetY }} = event;
    const { mapStyle } = this.state;
    // console.log(target);
    // if (target.className !== OVERLAYS_CLASSNAME) return;

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
    if (onTimezoneClick && hoveredFeature) {
      onTimezoneClick(event, hoveredFeature.properties.tzid)
    }
  }

  _renderTooltip() {
    const { x, y, hoveredFeature, lngLat, viewport } = this.state;
    const { source } = this.props;
    // console.log(hoveredFeature)
    if(!hoveredFeature || !lngLat) return null;
    const data =
      source.timezoneBoundaryBuilder.features.find(
        feature => feature.properties.tzid === hoveredFeature.properties.tzid
      )

    // console.log(data)
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
      // getLineColor: d => colorToRGBArray(d.properties.color),
      getRadius: 100,
      getLineWidth: 1,
      getElevation: 30,
      // onHover: ({object}) => setTooltip(object.properties.name || object.properties.station)
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
              // month: 'long', day: 'numeric'
              // year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              // timeZoneName: 'short'
            })}
          </p>
        </Tooltip>
      </React.Fragment>
    );
  }

  renderNeTooltip() {
    const { x, y, neTimeZoneFeature, lngLat } = this.state;

    if(!neTimeZoneFeature || !lngLat) return null;
    // console.log(neTimeZoneFeature.properties);
    var dt = DateTime.local().setZone(time_zoneParser(neTimeZoneFeature.properties.time_zone), { keepLocalTime: false })
    // console.log(dt.toLocaleString({
    //   // month: 'long', day: 'numeric'
    //   // year: 'numeric',
    //   timeZoneName: 'long',
    //   // month: 'long',
    //   // day: 'numeric',
    //   // hour: 'numeric',
    //   // minute: '2-digit',
    // }))
    return (
      neTimeZoneFeature && (
        <Tooltip style={{ top: y, left: x }}>
          <p>
            {dt.offsetNameLong}{' '}
            ({ dt.zoneName })
          </p>
          <p>
            {dt.toLocaleString({
              // month: 'long', day: 'numeric'
              // year: 'numeric',
              // timeZoneName: 'long',
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
    const { source, selectTimezone } = this.props;
    const { mapStyle, viewport } = this.state;
    // console.log(hoveredFeature)
    // if(!hoveredFeature && !lngLat) return null;

    // if(!hoveredFeature) return null;
    if(selectTimezone) {
      console.log(selectTimezone, normalizeZone(selectTimezone))
    }

    const data =
      source.timezoneBoundaryBuilder.features.find(
        feature => feature.properties.tzid === selectTimezone
      )

    // console.log(data)
    const layer = new GeoJsonLayer({
      id: 'geojson-layer',
      data,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getFillColor: [0, 0, 0, 190],
      // getLineColor: d => colorToRGBArray(d.properties.color),
      getRadius: 100,
      getLineWidth: 1,
      getElevation: 30,
      // onHover: ({object}) => setTooltip(object.properties.name || object.properties.station)
    });

    return (
      <DeckGL {...viewport} layers={[layer]}/>
    );
  }

  render() {
    const { mapboxApiAccessToken } = this.props;
    const { mapStyle, viewport } = this.state;

    return (
      <div onClick={this.handleClick}>
        <MapGL
          { ...viewport }
          minZoom={1}
          maxZoom={6}
          mapStyle={mapStyle}
          onHover={this._onHover}
          // onClick={this.handleClick}

          onViewportChange={this._updateViewport}
          mapboxApiAccessToken={mapboxApiAccessToken}
          doubleClickZoom={false}
        >
          {this._renderTooltip()}
          {this.renderNeTooltip()}
          {this.renderSelectTimezone()}

          <NavigationControlWrapper>
            <NavigationControl onViewportChange={this._updateViewport} />
          </NavigationControlWrapper>
        </MapGL>
      </div>

    );
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
        // findBoundaryFillLayer,
    };
  })
)(TimezoneMapGL)

// ();
