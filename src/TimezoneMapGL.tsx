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
import MapGL, { NavigationControl, Source, Layer } from 'react-map-gl'
import { DateTime } from 'luxon'
import { feature as topoFeature } from 'topojson-client'
import MAP_STYLE from './basic-v9.json'
// import { withSource } from './context'
import timezoneParser from './utils/timezoneParser'
import styles from './TimezoneMapGL.module.css'
import SelectTimeZoneLayer from './SelectTimeZoneLayer'
import { dataLayers } from './map-style'

interface TimezoneMapGLProps {
  defaultMapStyle?: any
  defaultViewport?: any
  source?: any
  mapboxApiAccessToken: string
  timezone?: string
  onTimezoneClick?: (timezone: string) => void
}

const TimezoneMapGL: FC<TimezoneMapGLProps> = (props) => {
  const {
    onTimezoneClick,
    defaultMapStyle = MAP_STYLE,
    source: sourceProp,
    timezone
  } = props

  //   import { feature as topoFeature } from "topojson-client";

  const sourceRef = useRef(sourceProp)
  const [state, setState] = useState<any>({
    lngLat: null
    // mapStyle: null
  })

  const [mapStyle, setMapStyle] = useState<any>(MAP_STYLE)
  const [timeZoneFillFeatureId, setTimeZoneFillFeatureId] = useState<
    string | null
  >(null)
  const [hoveredFeatureTzid, setHoveredFeatureTzid] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (sourceProp?.naturalEarth) {
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
        // nextStyle.sources['timezone-source'] = {
        //   type: 'geojson',
        //   data: sourceRef.current.naturalEarth
        // }
        // // @ts-ignore
        // nextStyle.sources['timezone-boundary-builder'] = {
        //   type: 'geojson',
        //   data: sourceRef.current.timezoneBoundaryBuilder
        // }
        console.log(preStyle)
        return { ...preStyle }
      })
    }
  }, [!!sourceProp?.naturalEarth])

  const selectTimezoneData = useMemo(() => {
    return sourceRef?.current?.timezoneBoundaryBuilder?.features?.find?.(
      (feature) => feature.properties.tzid === timezone
    )
  }, [timezone, !!sourceRef?.current])

  const hoverTimezoneData = sourceRef.current?.timezoneBoundaryBuilder?.features?.find?.(
    (feature) => feature.properties.tzid === hoveredFeatureTzid
  )

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

  const handleMouseOut = () => {
    setTimeZoneFillFeatureId(null)
    setHoveredFeatureTzid(null)
  }

  const handleHover = useDebounceCallback((event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY }
    } = event

    const hoveredFeature = features?.find?.(
      (f) => f.layer.id === 'timezone-boundary-builder-fill'
    )
    console.log(hoveredFeature)

    if (hoveredFeature?.properties?.tzid) {
      setHoveredFeatureTzid(hoveredFeature.properties.tzid)
      setTimeZoneFillFeatureId(null)
    } else {
      const neTimeZoneFeature = features?.find?.(
        (f) => f.layer.id === 'timezone-fill'
      )
      console.log(neTimeZoneFeature.properties.objectid)
      if (neTimeZoneFeature?.properties?.objectid) {
        setTimeZoneFillFeatureId(neTimeZoneFeature.properties.objectid)
        setHoveredFeatureTzid(null)
      }
    }

    setState({
      x: offsetX,
      y: offsetY
    })
  }, 2)

  const handleClick = (event) => {
    if (hoveredFeatureTzid) {
      // eslint-disable-next-line no-unused-expressions
      onTimezoneClick?.(hoveredFeatureTzid)
    }
  }

  const renderTooltip = () => {
    const { x, y } = state
    if (!hoveredFeatureTzid) return null

    const dt = DateTime.local().setZone(hoveredFeatureTzid)

    return (
      <div className={styles.tooltip} style={{ top: y, left: x }}>
        <p>
          {dt.offsetNameLong} ({dt.offsetNameShort})
        </p>
        <p>{dt.zoneName}</p>
        <p>
          {DateTime.local().setZone(hoveredFeatureTzid).toLocaleString({
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

    const feature = sourceRef?.current?.naturalEarth?.features?.find?.(
      (feature) => feature?.properties?.objectid === timeZoneFillFeatureId
    )

    // const data = sourceRef.current?.timezoneBoundaryBuilder?.features?.find?.(
    //   (feature) => feature.properties.tzid === hoveredFeature.properties.tzid
    // )
    if (!feature) return null

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

  const { mapboxApiAccessToken } = props

  if (!sourceRef?.current?.naturalEarth) {
    return null
  }

  return (
    <div onClick={handleClick} onMouseOut={handleMouseOut}>
      {mapStyle ? (
        <MapGL
          {...viewport}
          minZoom={1}
          maxZoom={6}
          mapStyle={MAP_STYLE}
          // mapStyle='mapbox://styles/mapbox/light-v10'
          // mapStyle='mapbox://styles/mapbox/light-v9'
          onHover={handleHover}
          onViewportChange={handleViewportChange}
          mapboxApiAccessToken={mapboxApiAccessToken}
          doubleClickZoom={false}
          // scrollZoom={false}
        >
          {/* dataLayers */}
          <Source
            type='geojson'
            data={sourceRef?.current?.naturalEarth}
            // key={!!sourceRef?.current?.naturalEarth}
          >
            <Layer
              id='timezone-fill'
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
          {/* {sourceRef?.current?.naturalEarth && (
            <Source
              id='timezone-source'
              type='geojson'
              data={sourceRef?.current?.naturalEarth}
            ></Source>
          )} */}
          {/* {
        "id": "timezone-line",
        "source": "timezone-source",
        "type": "line",
        "paint": {
          "line-color": "#81452E"
        },
        "interactive": false
      },
      {
       
        "interactive": true
      }, */}

          {dataLayers.map((dataLayer) => (
            <Layer key={dataLayer.id} {...dataLayer} />
          ))}
          <Source
            type='geojson'
            data={sourceRef?.current?.naturalEarth}
            // id='test'
          >
            <Layer
              // id='timezone-line'
              // source='test'
              type='line'
              paint={{
                'line-color': '#81452E',
                'line-width': {
                  base: 1,
                  stops: [
                    [3, 0.5],
                    [22, 15]
                  ]
                }
              }}
            />
          </Source>
          <Source
            type='geojson'
            data={sourceRef?.current?.timezoneBoundaryBuilder}
          >
            <Layer
              id='timezone-boundary-builder-fill'
              // source='timezone-boundary-builder'
              type='fill'
              paint={{
                'fill-outline-color': '#81452E',
                'fill-color': 'red',
                'fill-opacity': 0
              }}
            />
          </Source>

          <SelectTimeZoneLayer selectTimezoneData={selectTimezoneData} />
          {hoveredFeatureTzid && (
            <Source
              key={hoveredFeatureTzid}
              type='geojson'
              data={hoverTimezoneData}
            >
              <Layer
                {...{
                  // id: 'data',
                  type: 'fill',
                  paint: {
                    'fill-color': 'black',
                    'fill-opacity': 0.8
                  }
                }}
              />
            </Source>
          )}

          {renderTooltip()}
          {renderNeTooltip()}

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
