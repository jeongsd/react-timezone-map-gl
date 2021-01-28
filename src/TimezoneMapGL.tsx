/* eslint-disable spaced-comment, no-unused-vars */
import { useDebounce, useDebounceCallback } from '@react-hook/debounce'
import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  FC,
  useEffect
} from 'react'
// import { compose, withProps, defaultProps } from 'recompose'
import { fromJS } from 'immutable'
import MapGL, { NavigationControl, Source, Layer } from 'react-map-gl'
import DeckGL, { GeoJsonLayer } from 'deck.gl'
import { DateTime, Info } from 'luxon'
import { feature as topoFeature } from 'topojson-client'
import MAP_STYLE from './basic-v9.json'
// import { withSource } from './context'
import timezoneParser from './utils/timezoneParser'
import styles from './TimezoneMapGL.module.css'
import SelectTimeZoneLayer from './SelectTimeZoneLayer'
import { dataLayers } from './map-style'

const findLayer = (id) =>
  fromJS(MAP_STYLE)
    .get('layers')
    .findIndex((layer) => layer.get('id') === id)

const FIND_NE_FILL_LAYER = findLayer('timezone-fill')

// compose(
//   withSource,
//   defaultProps({
//     defaultMapStyle: MAP_STYLE
//   }),
//   withProps(({ source, defaultMapStyle }) => {
//     let finalDefaultMapStyle = defaultMapStyle
//     finalDefaultMapStyle['sources']['timezone-source'] = {
//       type: 'geojson',
//       data: source.naturalEarth
//     }
//     finalDefaultMapStyle['sources']['timezone-boundary-builder'] = {
//       type: 'geojson',
//       data: source.timezoneBoundaryBuilder
//     }
//     return {
//       defaultMapStyle: finalDefaultMapStyle
//     }
//   })
// )()

// TimezoneMapGL.propTypes = {
//   defaultMapStyle: PropTypes.object,
//   defaultViewport: PropTypes.object,
//   mapboxApiAccessToken: PropTypes.string.isRequired,
//   timezone: PropTypes.string,
//   onTimezoneClick: PropTypes.func
// }

// TimezoneMapGL.defaultProps = {
//   timezone: null,
//   defaultViewport: {
//     width: 1030,
//     height: 750,
//     latitude: 0,
//     longitude: 0,
//     zoom: 1,
//     bearing: 0,
//     pitch: 0
//   }
// }

interface TimezoneMapGLProps {
  defaultMapStyle?: any
  defaultViewport?: any
  source?: any
  mapboxApiAccessToken: string
  timezone?: string
  onTimezoneClick?: () => void
}

const TimezoneMapGL: FC<TimezoneMapGLProps> = (props) => {
  const { defaultMapStyle = MAP_STYLE, source: sourceProp, timezone } = props

  //   import { feature as topoFeature } from "topojson-client";

  const sourceRef = useRef(sourceProp)
  const [state, setState] = useState<any>({
    hoveredFeature: null,
    neTimeZoneFeature: null,
    lngLat: null
    // mapStyle: null
  })

  const [mapStyle, setMapStyle] = useState<any>(null)
  const [timeZoneFillFeatureId, setTimeZoneFillFeatureId] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (sourceProp?.naturalEarth) {
      console.log('asjdkladjkd')
      sourceRef.current = sourceProp
      sourceRef.current = {
        naturalEarth: topoFeature(
          sourceRef.current.naturalEarth,
          sourceRef.current.naturalEarth.objects.ne_10m_time_zones
        ),
        timezoneBoundaryBuilder: topoFeature(
          sourceRef.current.timezoneBoundaryBuilder,
          sourceRef.current.timezoneBoundaryBuilder.objects.combined_shapefile
        )
      }
      setMapStyle((preStyle) => {
        const nextStyle = preStyle ? { ...preStyle } : { ...MAP_STYLE }
        nextStyle.sources['timezone-source'] = {
          type: 'geojson',
          data: sourceRef.current.naturalEarth
        }
        // @ts-ignore
        nextStyle.sources['timezone-boundary-builder'] = {
          type: 'geojson',
          data: sourceRef.current.timezoneBoundaryBuilder
        }
        return nextStyle
      })
      // mapStyle
    }
    // MAP_STYLE
    // return {
    //   naturalEarth: ,
    //   timezoneBoundaryBuilder:
    // }
  }, [!!sourceProp?.naturalEarth])

  const selectTimezoneData = useMemo(() => {
    console.log('useMemo')
    return sourceRef?.current?.timezoneBoundaryBuilder?.features?.find?.(
      (feature) => feature.properties.tzid === timezone
    )
  }, [timezone, !!sourceRef?.current])

  const { hoveredFeature, lngLat } = state
  const hoverTimezoneData = useMemo(() => {
    if (hoveredFeature && lngLat) {
      const data = sourceRef.current?.timezoneBoundaryBuilder?.features?.find?.(
        (feature) => feature.properties.tzid === hoveredFeature.properties.tzid
      )
      return data
    }
  }, [!!hoveredFeature, !!lngLat])

  //   hoveredFeature
  // lngLat
  // console.log(selectTimezoneData)

  const [viewport, setViewport] = useState({
    width: 1030,
    height: 750,
    latitude: 0,
    longitude: 0,
    zoom: 1,
    bearing: 0,
    pitch: 0,
    ...props.defaultViewport
  })

  const handleViewportChange = useCallback((nextViewport) => {
    setViewport(nextViewport)
  }, [])

  const handleMouseOut = () =>
    setState((prev) =>
      Object.assign({}, prev, {
        hoveredFeature: null,
        neTimeZoneFeature: null,
        lngLat: null
      })
    )
  const handleHover = useDebounceCallback((event) => {
    const {
      features,
      lngLat,
      srcEvent: { offsetX, offsetY }
    } = event

    // consolee.log(features)

    // console.log('asd??')
    // console.log(performance.now())
    const hoveredFeature =
      features &&
      features.find((f) => f.layer.id === 'timezone-boundary-builder-fill')
    // console.log(performance.now())
    let neTimeZoneFeature
    if (!hoveredFeature) {
      neTimeZoneFeature =
        features && features.find((f) => f.layer.id === 'timezone-fill')
    }

    if (neTimeZoneFeature?.properties?.objectid) {
      setTimeZoneFillFeatureId(neTimeZoneFeature.properties.objectid)
    }
    console.log()
    // console.log(performance.now())
    // const newState: any = {}
    // const newMapStyle = { ...mapStyle }
    // // console.log(performance.now())
    // if (hoveredFeature) {
    //   newState.hoveredFeature = hoveredFeature
    //   newState.neTimeZoneFeature = null
    // } else if (neTimeZoneFeature) {
    //   newState.neTimeZoneFeature = neTimeZoneFeature
    //   newState.hoveredFeature = null
    //   newMapStyle.layers[FIND_NE_FILL_LAYER].paint['fill-opacity'][1][1][2] =
    //
    //   // setMapStyle(newMapStyle)
    // }

    setState({
      lngLat,
      x: offsetX,
      y: offsetY
      // mapStyle: newMapStyle,
      // ...newState
    })
  }, 2)

  const handleClick = (event) => {
    const { onTimezoneClick } = props
    const { hoveredFeature } = state
    // const tzid = hoveredFeature?.properties?.tzid

    // if (onTimezoneClick && tzid) {
    //   onTimezoneClick(event, tzid)
    // }
  }

  const renderTooltip = () => {
    const { x, y, hoveredFeature, lngLat } = state
    if (!hoveredFeature || !lngLat) return null

    const dt = DateTime.local().setZone(hoveredFeature.properties.tzid)

    return (
      <div className={styles.tooltip} style={{ top: y, left: x }}>
        <p>
          {dt.offsetNameLong} ({dt.offsetNameShort})
        </p>
        <p>{dt.zoneName}</p>
        <p>
          {DateTime.local()
            .setZone(hoveredFeature.properties.tzid)
            .toLocaleString({
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
        </p>
      </div>
    )
  }

  const renderNeTooltip = () => {
    const { x, y, neTimeZoneFeature, lngLat } = state

    console.log(sourceRef?.current?.naturalEarth, timeZoneFillFeatureId)

    const feature = sourceRef?.current?.naturalEarth?.features?.find?.(
      (feature) => feature?.properties?.objectid === timeZoneFillFeatureId
    )

    // const data = sourceRef.current?.timezoneBoundaryBuilder?.features?.find?.(
    //   (feature) => feature.properties.tzid === hoveredFeature.properties.tzid
    // )
    if (!lngLat || !feature) return null

    var dt = DateTime.local().setZone(
      timezoneParser(feature.properties.time_zone as string),
      {
        keepLocalTime: false
      }
    )

    return (
      feature && (
        <div className={styles.tooltip} style={{ top: y, left: x }}>
          <p>
            {dt.offsetNameLong} ({dt.zoneName})
          </p>
          <p>
            {dt.toLocaleString({
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </p>
        </div>
      )
    )
  }

  const renderSelectOrHoveredTimezone = () => {
    // const { source, timezone } = props
    const { hoveredFeature, lngLat } = state

    const layers = []
    if (timezone && Info.isValidIANAZone(timezone)) {
      const data = sourceRef.current.timezoneBoundaryBuilder.features.find(
        (feature) => feature.properties.tzid === timezone
      )
      layers.push(
        // @ts-ignore
        new GeoJsonLayer({
          id: 'select-timezone-layer',
          data,
          pickable: true,
          stroked: false,
          filled: true,
          extruded: true,
          lineWidthScale: 20,
          lineWidthMinPixels: 2,
          getFillColor: [255, 255, 255, 150],
          getRadius: 100,
          getLineWidth: 1,
          getElevation: 30
        } as any)
      )
    }

    if (hoveredFeature && lngLat) {
      const data = sourceRef.current?.timezoneBoundaryBuilder?.features?.find?.(
        (feature) => feature.properties.tzid === hoveredFeature.properties.tzid
      )
      if (data) {
        console.log('data', data)
        layers.push(
          // @ts-ignore
          new GeoJsonLayer({
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
            getElevation: 30
          })
        )
      }
    }

    return <DeckGL {...viewport} layers={layers} />
  }

  const { mapboxApiAccessToken } = props
  // const { mapStyle } = state
  // console.log('asddads', mapStyle)

  // console.log(sourceRef?.current?.naturalEarth)
  // sourceRef.current.naturalEarth
  return (
    <div onClick={handleClick} onMouseOut={handleMouseOut}>
      {mapStyle ? (
        <MapGL
          {...viewport}
          minZoom={1}
          maxZoom={6}
          mapStyle={mapStyle}
          // mapStyle='mapbox://styles/mapbox/light-v10'
          // mapStyle='mapbox://styles/mapbox/light-v9'
          onHover={handleHover}
          onViewportChange={handleViewportChange}
          mapboxApiAccessToken={mapboxApiAccessToken}
          doubleClickZoom={false}
          // scrollZoom={false}
        >
          {/* dataLayers */}

          <Source type='geojson' data={sourceRef?.current?.naturalEarth}>
            <Layer
              id='timezone-fill'
              source='timezone-source'
              type='fill'
              paint={{
                'fill-opacity': [
                  'case',
                  [
                    'boolean',
                    ['==', ['get', 'objectid'], timeZoneFillFeatureId]
                  ],
                  1,
                  0.6
                ],
                'fill-color': {
                  property: 'map_color8',
                  stops: [
                    [1, '#E1C281'],
                    [2, '#DD9D75'],
                    [3, '#98AEB0'],
                    [4, '#C2C97F'],
                    [5, '#E1C281'],
                    [6, '#DD9D75'],
                    [7, '#C2C97F'],
                    [8, '#98AEB0']
                  ]
                }
              }}

              // interactive
            />
          </Source>

          {dataLayers.map((dataLayer) => (
            <Layer key={dataLayer.id} {...dataLayer} />
          ))}

          {/* dataLayers */}
          {/* {renderSelectOrHoveredTimezone()} */}
          <SelectTimeZoneLayer selectTimezoneData={selectTimezoneData} />

          {renderTooltip()}
          {renderNeTooltip()}

          {/* {hoverTimezoneData && (
            <Source type='geojson' data={hoverTimezoneData}>
              <Layer
                id='data'
                type='fill'
                paint={{ 'fill-color': '#00ffff' }}
              />
            </Source>
          )} */}

          <div className={styles.navigationControlWrapper}>
            <NavigationControl onViewportChange={handleViewportChange} />
          </div>
        </MapGL>
      ) : (
        ''
      )}
    </div>
  )
}

// TimezoneMapGL.propTypes = {
//   defaultMapStyle: PropTypes.object,
//   defaultViewport: PropTypes.object,
//   mapboxApiAccessToken: PropTypes.string.isRequired,
//   timezone: PropTypes.string,
//   onTimezoneClick: PropTypes.func
// }

// TimezoneMapGL.defaultProps = {
//   timezone: null,
//   defaultViewport: {
//     width: 1030,
//     height: 750,
//     latitude: 0,
//     longitude: 0,
//     zoom: 1,
//     bearing: 0,
//     pitch: 0
//   }
// }

export default TimezoneMapGL
// {
//   "id": "water",
//   "type": "fill",
//   "source": "mapbox",
//   "source-layer": "water",
//   "paint": {
//     "fill-color": "white",
//     "fill-opacity": 0.6,
//     "fill-outline-color": "red"
//   },
//   "interactive": false
// },
// {
//   "interactive": false,
//   "layout": {
//     "line-cap": "round",
//     "line-join": "round"
//   },
//   "filter": [
//     "all",
//     ["==", "$type", "LineString"],
//     ["all", ["<=", "admin_level", 2], ["==", "maritime", 0]]
//   ],
//   "type": "line",
//   "source": "mapbox",
//   "id": "admin_country",
//   "paint": {
//     "line-color": "red",
//     "line-width": {
//       "base": 1.3,
//       "stops": [
//         [3, 0.5],
//         [22, 15]
//       ]
//     }
//   },
//   "source-layer": "admin"
// },
// {
//   "interactive": false,
//   "layout": {
//     "text-field": "{name_en}",
//     "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
//     "text-max-width": 10,
//     "text-size": {
//       "stops": [
//         [3, 14],
//         [8, 16]
//       ]
//     }
//   },
//   "maxzoom": 12,
//   "filter": ["==", "$type", "Point"],
//   "type": "symbol",
//   "source": "mapbox",
//   "id": "country_label",
//   "paint": {
//     "text-color": "black"
//   },
//   "source-layer": "country_label"
// }
