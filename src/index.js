import React, {Component} from 'react'
import { fromJS } from 'immutable';
import { InteractiveMap } from 'react-map-gl';
// import {InteractiveMap} from 'react-map-gl';
import DeckGL, { GeoJsonLayer, LineLayer } from 'deck.gl';
import {scaleThreshold} from 'd3-scale';
// import timezone from './timezone.json';

import MAP_STYLE from './basic-v9.json';
import timezone2 from './test.json';
// import bart from './bart.geo.json';

// console.log(timezone)


let defaultMapStyle = fromJS(MAP_STYLE);


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

const LIGHT_SETTINGS = {
  lightsPosition: [-125, 50.5, 5000, -122.8, 48.5, 8000],
  ambientRatio: 0.2,
  diffuseRatio: 0.5,
  specularRatio: 0.3,
  lightsStrength: [1.0, 0.0, 2.0, 0.0],
  numberOfLights: 2
};

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
// map_color8

const dataLayer1 = fromJS({
  id: 'geojson-polygon-fill',
  source: 'my-geojson-polygon-source',
  type: 'fill',
  paint: {
    // "fill-color": 'white'
    "fill-color": {
      "property": "map_color6",
      "stops": [
          // zoom is 0 and "rating" is 0 -> circle radius will be 0px
          [1, '#3288bd'],
          [2, '#ffffbf'],
          [3, '#66c2a5'],

          // [3, '#e6f598'],

          // [5, '#fee08b'],
          [4, '#fdae61'],
          [5, '#abdda4'],
          // [5, '#f46d43'],
          [6, '#d53e4f'],
      ]
    },
    // 'fill-color': 'red',
    // 'fill-opacity': 0.4,
    // ["==", "class", "street_limited"],
    // "fill-opacity": ["==", 'tz_name1st', "Asia/Dhaka"
    //     // ["boolean", ["feature-state", "hover"], false],
    //     //   0.5,
    //     //   0.2
    // ],
    // 'circle-radius': ['-', 2017, ['number', ['get', 'Constructi'], 2017]],
    "fill-opacity": ["case",
    // ["feature-state", "hover"]
        ["boolean", ["==", ['get', 'objectid'], "placehodler_objectid"]],
        // ["boolean", ["feature-state", "hover"], false],
          0.6,
          0.3
      ]

  },
  interactive: true
});


// fill-color



const dataLayer2 = fromJS({
  id: 'geojson-polygon-stroke',
  source: 'my-geojson-polygon-source',
  type: 'line',
  paint: {'line-color': '#81452E', 'line-width': 1},
  interactive: false
});


defaultMapStyle = defaultMapStyle
  .setIn(['sources', 'my-geojson-polygon-source'], fromJS({type: 'geojson', data: timezone2 }))
  .set('layers', defaultMapStyle.get('layers').push(dataLayer1))
defaultMapStyle = defaultMapStyle.set('layers', defaultMapStyle.get('layers').push(dataLayer2));

export const highlightLayerIndex = defaultMapStyle.get('layers').findIndex(layer => layer.get('id') === 'geojson-polygon-fill')

export default class extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hoveredFeature: null,
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
    const {features, srcEvent: {offsetX, offsetY}} = event;
    // console.log(features);
    const hoveredFeature = features && features.find(f => f.layer.id === 'geojson-polygon-fill');
    const countryFeature = features && features.find(f => f.layer.id === 'admin_country');
    // console.log(defaultMapStyle, defaultMapStyle.get(['layers', highlightLayerIndex, 'paint', 'fill-opacity']));
    // console.log(hoveredFeature);
    this.setState({
      hoveredFeature,
      countryFeature,
      x: offsetX,
      y: offsetY,
      mapStyle: defaultMapStyle.setIn(['layers', highlightLayerIndex, 'paint', 'fill-opacity', 1, 1, 2], hoveredFeature.properties.objectid),
    });
  };

  handleClick = (event) => {
    console.log(event.features);
  }

  _renderTooltip() {
    const { x, y, hoveredFeature, countryFeature } = this.state;
    // console.log(countryFeature);
    return (
      hoveredFeature && (
        <div className="tooltip" style={{top: y, left: x}}>
          <p>
            {hoveredFeature.properties.tz_name1st}
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


    // const mapStyle = {
    //   version: 8,
    //   name: 'Example raster tile source',
    //   sources: {
    //     'my-geojson-polygon-source': {
    //       type: 'geojson',
    //       data: timezone2
    //     }
    //   },
    //   layers: [
    //     {
    //       id: 'geojson-polygon-fill',
    //       source: 'my-geojson-polygon-source',
    //       type: 'fill',
    //       paint: {
    //         'fill-color': 'white',
    //         'fill-opacity': 0.1
    //       },
    //       interactive: true
    //     }, {
    //       id: 'geojson-polygon-stroke',
    //       source: 'my-geojson-polygon-source',
    //       type: 'line',
    //       paint: {'line-color': 'black', 'line-width': 1},
    //       interactive: false
    //     }
    //   ]
    // }

    return (
      <InteractiveMap
        mapStyle={mapStyle}
        width={1030}
        height={800}
        onHover={this._onHover}
        onClick={this.handleClick}
        { ...viewport }

        // onViewportChange={ this._onViewportChange }
        // onClick={ this._onClickFeatures }
        mapboxApiAccessToken={mapboxApiAccessToken}
        preventStyleDiffing={ false }
      >
        {this._renderTooltip()}
      </InteractiveMap>
      // <DeckGL
      //   width={1000}
      //   height={800}
      //   viewState={viewState} layers={layers} controller>
      //   {/* <StaticMap
      //     reuseMaps
      //     // mapStyle="mapbox://styles/mapbox/light-v9"
      //     // preventStyleDiffing={true}
      //     mapboxApiAccessToken={mapboxApiAccessToken}
      //   /> */}
      // </DeckGL>
      // <DeckGL
      //   layers={this._renderLayers()}
      //   initialViewState={INITIAL_VIEW_STATE}
      //   viewState={viewState}
      //   controller={controller}
      // >
      //   {baseMap && (
      //     <StaticMap
      //       reuseMaps
      //       mapStyle="mapbox://styles/mapbox/light-v9"
      //       preventStyleDiffing={true}
      //       mapboxApiAccessToken={mapboxApiAccessToken}
      //     />
      //   )}

      //   {this._renderTooltip}
      // </DeckGL>
    );
  }
}
