// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const dataLayers = [
  {
    id: 'water',
    type: 'fill',
    source: 'mapbox',
    'source-layer': 'water',
    paint: {
      'fill-color': 'white',
      'fill-opacity': 0.6,
      'fill-outline-color': '#afafaf'
    },
    interactive: false
  },
  {
    interactive: false,
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    filter: [
      'all',
      ['==', '$type', 'LineString'],
      ['all', ['<=', 'admin_level', 2], ['==', 'maritime', 0]]
    ],
    type: 'line',
    source: 'mapbox',
    id: 'admin_country',
    paint: {
      'line-color': 'white',
      'line-width': {
        base: 1.3,
        stops: [
          [3, 0.5],
          [22, 15]
        ]
      }
    },
    'source-layer': 'admin'
  },
  {
    interactive: false,
    minzoom: 5,
    layout: {
      'icon-image': '{maki}-11',
      'text-offset': [0, 0.5],
      'text-field': '{name_en}',
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-max-width': 8,
      'text-anchor': 'top',
      'text-size': 11,
      'icon-size': 1
    },
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['all', ['==', 'scalerank', 1], ['==', 'localrank', 1]]
    ],
    type: 'symbol',
    source: 'mapbox',
    id: 'poi_label',
    paint: {
      'text-color': '#666',
      'text-halo-width': 1,
      'text-halo-color': 'rgba(255,255,255,0.75)',
      'text-halo-blur': 1
    },
    'source-layer': 'poi_label'
  },
  {
    interactive: false,
    layout: {
      'symbol-placement': 'line',
      'text-field': '{name_en}',
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-transform': 'uppercase',
      'text-letter-spacing': 0.1,
      'text-size': {
        base: 1.4,
        stops: [
          [10, 8],
          [20, 14]
        ]
      }
    },
    filter: [
      'all',
      ['==', '$type', 'LineString'],
      ['in', 'class', 'motorway', 'primary', 'secondary', 'tertiary', 'trunk']
    ],
    type: 'symbol',
    source: 'mapbox',
    id: 'road_major_label',
    paint: {
      'text-color': '#666',
      'text-halo-color': 'rgba(255,255,255,0.75)',
      'text-halo-width': 2
    },
    'source-layer': 'road_label'
  },
  {
    interactive: false,
    minzoom: 8,
    layout: {
      'text-field': '{name_en}',
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-max-width': 6,
      'text-size': {
        stops: [
          [6, 12],
          [12, 16]
        ]
      }
    },
    filter: [
      'all',
      ['==', '$type', 'Point'],
      [
        'in',
        'type',
        'town',
        'village',
        'hamlet',
        'suburb',
        'neighbourhood',
        'island'
      ]
    ],
    type: 'symbol',
    source: 'mapbox',
    id: 'place_label_other',
    paint: {
      'text-color': '#666',
      'text-halo-color': 'rgba(255,255,255,0.75)',
      'text-halo-width': 1,
      'text-halo-blur': 1
    },
    'source-layer': 'place_label'
  },
  {
    interactive: false,
    layout: {
      'text-field': '{name_en}',
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-max-width': 10,
      'text-size': {
        stops: [
          [3, 12],
          [8, 16]
        ]
      }
    },
    maxzoom: 16,
    filter: ['all', ['==', '$type', 'Point'], ['==', 'type', 'city']],
    type: 'symbol',
    source: 'mapbox',
    id: 'place_label_city',
    paint: {
      'text-color': '#666',
      'text-halo-color': 'rgba(255,255,255,0.75)',
      'text-halo-width': 1,
      'text-halo-blur': 1
    },
    'source-layer': 'place_label'
  },
  {
    interactive: false,
    layout: {
      'text-field': '{name_en}',
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-max-width': 10,
      'text-size': {
        stops: [
          [3, 14],
          [8, 16]
        ]
      }
    },
    maxzoom: 12,
    filter: ['==', '$type', 'Point'],
    type: 'symbol',
    source: 'mapbox',
    id: 'country_label',
    paint: {
      'text-color': 'black'
    },
    'source-layer': 'country_label'
  },
  {
    interactive: false,
    layout: {
      'text-transform': 'uppercase',
      'text-field': '{name_en}',
      'text-font': ['Open Sans Italic', 'Arial Unicode MS Regular'],
      'text-max-width': 5,
      'text-size': {
        stops: [
          [3, 16],
          [8, 20]
        ]
      }
    },
    maxzoom: 12,
    filter: ['==', '$type', 'Point'],
    type: 'symbol',
    source: 'mapbox',
    id: 'marine_label',
    paint: {
      'text-color': '#333333'
    },
    'source-layer': 'marine_label'
  }
]
