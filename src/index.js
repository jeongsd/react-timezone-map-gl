import React, {Component} from 'react'
import { fromJS } from 'immutable';
import { InteractiveMap } from 'react-map-gl';
// import {InteractiveMap} from 'react-map-gl';
import DeckGL, { GeoJsonLayer, LineLayer } from 'deck.gl';
import ts from '@mapbox/timespace';
import { scaleThreshold } from 'd3-scale';
import { tileToGeoJSON } from '@mapbox/tilebelt';
import timezoneMeta from 'moment-timezone/data/meta/latest.json'
// import timezone from './timezone.json';

import MAP_STYLE from './basic-v9.json';
import timezone2 from './test.json';
// import bart from './bart.geo.json';

// console.log(timezone)


let defaultMapStyle = fromJS(MAP_STYLE);

// "219/98/8":"Asia/Seoul","216/99/8":"Asia/Seoul","217/99/8":"Asia/Seoul","165/108/8"
export const COLOR_SCALE = scaleThreshold()
  .domain([-0.6, -0.45, -0.3, -0.15, 0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2])
  .range([
    [65, 182, 196],
    [127, 205, 187],
    [199, 233, 180],
    [237, 248, 177],
    // zero
    [255, 255, 204],
    [255, 237, 160],
    [254, 217, 118],
    [254, 178, 76],
    [253, 141, 60],
    [252, 78, 42],
    [227, 26, 28],
    [189, 0, 38],
    [128, 0, 38]
  ]);


export const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 2,
  maxZoom: 10,
  pitch: 0,
  bearing: 0
};


const MAP_COLOR = [
  [244, 67, 54,  70],
  [103, 58, 183,  70],
  [3,169,244, 70],
  [156,39,176, 70],
  [205,220,57, 70],
  [255,235,59, 70],
  [121,85,72, 70],
  [63,81,181, 70]
]


defaultMapStyle = defaultMapStyle
  .setIn(['sources', 'timezone-source'], fromJS({type: 'geojson', data: timezone2 }))

defaultMapStyle = defaultMapStyle
  .setIn(
    ['sources', 'timezone-select'],
    fromJS({
      type: 'geojson',
      data: {
          "type": "FeatureCollection",
          "features": [{
              "type": "Feature",
              "properties": {},
              "geometry": {
                "type": "Polygon",
                "coordinates": [
                 [
                  [
                    127.96875,
                    37.71859032558813
                   ],
                   [
                    127.96875,
                    38.82259097617712
                   ],
                   [
                    129.375,
                    38.82259097617712
                   ],
                   [
                    129.375,
                    37.71859032558813
                   ],
                   [
                    127.96875,
                    37.71859032558813
                   ]
                 ]
                ]
               }
          }, {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "Polygon",
              "coordinates": [
               [
                [
                  123.75,
                  37.71859032558813
                 ],
                 [
                  123.75,
                  38.82259097617712
                 ],
                 [
                  125.15625,
                  38.82259097617712
                 ],
                 [
                  125.15625,
                  37.71859032558813
                 ],
                 [
                  123.75,
                  37.71859032558813
                 ]
               ]
              ]
             }
        }, {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
             [
              [
                125.15625,
                37.71859032558813
               ],
               [
                125.15625,
                38.82259097617712
               ],
               [
                126.5625,
                38.82259097617712
               ],
               [
                126.5625,
                37.71859032558813
               ],
               [
                125.15625,
                37.71859032558813
               ]
             ]
            ]
           }
      }]
      }
   })
  )





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

  // _onHover({x, y, object}) {
  //   this.setState({x, y, hoveredFeature: object});
  // }

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
    console.log(event.features);
  }

  _renderTooltip() {
    const { x, y, hoveredFeature, lngLat } = this.state;
    // console.log(defaultMapStyle, defaultMapStyle.get(['layers', highlightLayerIndex, 'paint', 'fill-opacity']));
    // console.log(hoveredFeature);
    // console.log(countryFeature);
    // var timestamp = ;
    if(!hoveredFeature && !lngLat) return null;
    var time = ts.getFuzzyLocalTimeFromPoint(Date.now(), lngLat);
    // console.log(hoveredFeature.properties.tz_name1st)
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
{/*
          <div>
            <div>${hoveredFeature.properties.valuePerParcel} / parcel</div>
            <div>
              ${hoveredFeature.properties.valuePerSqm} / m<sup>2</sup>
            </div>
          </div>
          <div>
            <b>Growth</b>
          </div>
          <div>{Math.round(hoveredFeature.properties.growth * 100)}%</div> */}
        </div>
      )
    );
  }
  // "geometry": null,

  render() {
    // const {viewState, controller = true, baseMap = true} = this.props;
    const { mapboxApiAccessToken } = this.props;
    const { mapStyle } = this.state;
    const viewState = {
      longitude: 0,
      latitude: 70,
      zoom: 1,
      pitch: 0,
      bearing: 0
    };

    // const data = [{sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}];
    const layers = [
      // new LineLayer({id: 'line-layer', data}),
      new GeoJsonLayer({
        id: 'geojson-layer',
        data: timezone2,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: false,
        // lineWidthScale: 1,
        // lineWidthMinPixels: 2,
        // getFillColor: [160, 160, 180, 200],
        getFillColor: (d) => {
          // console.log(MAP_COLOR[d.properties.map_color8], d.properties.map_color8);
          // return [160, 160, 180, 200];
          // console.log(d.properties)
          return d.properties ? MAP_COLOR[d.properties.map_color8 - 1] : [160, 160, 180, 200];
        },
        getLineColor: 'black',
        getRadius: 10,
        getLineWidth: 1,
        // getElevation: 0,
        getElevation: 30,
        autoHighlight: true,
        highlightColor: [255, 0 , 0, 200],
        // wrapLongitude: true,
        // onHover: ({object}) => setTooltip(object.properties.name || object.properties.station)
      })
    ];

    const viewport =  {
      latitude: 30,
      longitude: 0,
      zoom: 1,
      bearing: 0,
      pitch: 0
    };

    // // "219/98/8":"Asia/Seoul","216/99/8":"Asia/Seoul","217/99/8":"Asia/Seoul","165/108/8"
    // console.log(tileToGeoJSON([219, 98, 8]))
    // console.log(tileToGeoJSON([216, 99, 8]))
    // console.log(tileToGeoJSON([217, 99, 8]))

    // var mergedGeoJSON = geojsonMerge.merge([

    // ]);

    // console.log(
    //   JSON.stringify(tileToGeoJSON([219, 98, 8]), null, ' '),
    //   JSON.stringify(tileToGeoJSON([216, 98, 8]), null, ' '),
    //   JSON.stringify(tileToGeoJSON([217, 98, 8]), null, ' ')
    // )

    // console.log(this.state.lngLat)
    return (
      <InteractiveMap
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
      </InteractiveMap>
    );
  }
}
126.91406249999946, 44.2365728743725