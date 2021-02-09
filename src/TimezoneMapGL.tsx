/* eslint-disable spaced-comment, no-unused-vars */
import { useDebounceCallback } from '@react-hook/debounce'
import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  FC,
  useEffect
} from 'react'
import MapGL, { NavigationControl, Source, Layer } from 'react-map-gl'
import { DateTime } from 'luxon'
import { feature as topoFeature } from 'topojson-client'
import MAP_STYLE from './basic-v9.json'
import timezoneParser from './utils/timezoneParser'
import styles from './TimezoneMapGL.module.css'
import SelectTimeZoneLayer from './SelectTimeZoneLayer'
import { dataLayers } from './map-style'

function parseSpecifier(s) {
  if (s) {
    const r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i)
    if (r) {
      console.log(r)
      // return new FixedOffsetZone(signedOffset(r[1], r[2]))
    }
  }
  return null
}

// https://github.com/moment/luxon/blob/53225fd1ca536bb14b804f6560f36d6cd5874bd0/src/impl/util.js#L194
export function parseZoneInfo(options: {
  timeZoneName?: string
  locale: string
  timeZone?: string
}) {
  const { timeZoneName = 'short', locale = 'default', timeZone } = options
  if (!Intl.DateTimeFormat) {
    return null
  }
  const date = new Date()
  const intlOpts = {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone
  }

  const modified = Object.assign({ timeZoneName: timeZoneName }, intlOpts)

  if (Intl.DateTimeFormat?.prototype?.formatToParts) {
    const parsed = new Intl.DateTimeFormat(locale, modified)
      .formatToParts(date)
      .find((m) => m.type.toLowerCase() === 'timezonename')
    return parsed ? parsed.value : null
  } else if (Intl.DateTimeFormat) {
    // this probably doesn't work for all locales
    const without = new Intl.DateTimeFormat(locale, intlOpts).format(date)
    const included = new Intl.DateTimeFormat(locale, modified).format(date)
    const diffed = included.substring(without.length)
    const trimmed = diffed.replace(/^[, \u200e]+/, '')
    return trimmed
  } else {
    return null
  }
}

interface TimezoneMapGLProps {
  defaultMapStyle?: any
  defaultViewport?: any
  source?: any
  mapboxApiAccessToken: string
  timezone?: string
  locale?: string
  onTimezoneClick?: (timezone: string) => void
  renderTooltip?: (props: {
    x: number
    y: number
    longTimezone?: string | null
    shortTimezone?: string | null
    timeZone: string
    isUTCTimeOffset: boolean
  }) => React.ReactNode
}

const TimezoneMapGL: FC<TimezoneMapGLProps> = (props) => {
  const {
    onTimezoneClick,
    defaultMapStyle = MAP_STYLE,
    locale = 'default',
    source: sourceProp,
    timezone,
    renderTooltip: renderTooltipProp
  } = props

  const sourceRef = useRef(sourceProp)
  const [tooltipPosition, setTooltipPosition] = useState<any>({
    x: 0,
    y: 0
  })

  const [loading, setLoading] = useState(true)
  const [timeZoneFillFeatureId, setTimeZoneFillFeatureId] = useState<
    string | null
  >(null)
  const [ianaTimezoneName, setIANATimezoneName] = useState<string | null>(null)

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
      setLoading(false)
    }
  }, [!!sourceProp?.naturalEarth])

  const selectTimezoneData = useMemo(() => {
    return sourceRef?.current?.timezoneBoundaryBuilder?.features?.find?.(
      (feature) => feature.properties.tzid === timezone
    )
  }, [timezone, !!sourceRef?.current])

  const hoverTimezoneData = sourceRef.current?.timezoneBoundaryBuilder?.features?.find?.(
    (feature) => feature.properties.tzid === ianaTimezoneName
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
    // setIANATimezoneName(null)
  }

  const handleHover = useDebounceCallback((event) => {
    const {
      features,
      srcEvent: { offsetX, offsetY }
    } = event

    const hoveredFeature = features?.find?.(
      (f) => f.layer.id === 'timezone-boundary-builder-fill'
    )

    if (hoveredFeature?.properties?.tzid) {
      setIANATimezoneName(hoveredFeature.properties.tzid)
      setTimeZoneFillFeatureId(null)
    } else {
      const neTimeZoneFeature = features?.find?.(
        (f) => f.layer.id === 'timezone-fill'
      )
      if (neTimeZoneFeature?.properties?.objectid) {
        setTimeZoneFillFeatureId(neTimeZoneFeature.properties.objectid)
        setIANATimezoneName(null)
      }
    }

    setTooltipPosition({ x: offsetX, y: offsetY })
  }, 2)

  const handleClick = (event) => {
    if (ianaTimezoneName) {
      // eslint-disable-next-line no-unused-expressions
      onTimezoneClick?.(ianaTimezoneName)
    }
  }

  const renderTooltip = () => {
    const { x, y } = tooltipPosition

    let timeZone: string | null = null
    let longTimezone: string | null = null
    let shortTimezone: string | null = null
    let isUTCTimeOffset = false

    if (ianaTimezoneName) {
      timeZone = ianaTimezoneName
      longTimezone = parseZoneInfo({
        locale,
        timeZone,
        timeZoneName: 'long'
      })
      shortTimezone = parseZoneInfo({
        locale,
        timeZone,
        timeZoneName: 'short'
      })
    } else if (timeZoneFillFeatureId) {
      const feature = sourceRef?.current?.naturalEarth?.features?.find?.(
        (feature) => feature?.properties?.objectid === timeZoneFillFeatureId
      )
      // eslint-disable-next-line camelcase
      if (!feature?.properties?.time_zone) return null

      timeZone = timezoneParser(feature.properties.utc_format).replace(
        'UTC',
        ''
      )
      isUTCTimeOffset = true
    }
    if (!timeZone) return null

    return (
      renderTooltipProp?.({
        x,
        y,
        timeZone,
        longTimezone,
        shortTimezone,
        isUTCTimeOffset
      }) || null
    )
  }
  const { mapboxApiAccessToken } = props

  if (!sourceRef?.current?.naturalEarth) {
    return null
  }

  return (
    <div onClick={handleClick} onMouseOut={handleMouseOut}>
      {!loading ? (
        <MapGL
          {...viewport}
          minZoom={1}
          maxZoom={6}
          mapStyle={MAP_STYLE}
          onHover={handleHover}
          onViewportChange={handleViewportChange}
          mapboxApiAccessToken={mapboxApiAccessToken}
          doubleClickZoom={false}
        >
          <Source type='geojson' data={sourceRef?.current?.naturalEarth}>
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
            />
          </Source>

          {dataLayers.map((dataLayer) => (
            <Layer key={dataLayer.id} {...dataLayer} />
          ))}
          <Source type='geojson' data={sourceRef?.current?.naturalEarth}>
            <Layer
              type='line'
              paint={{
                'line-color': '#81452E',
                'line-width': 1.2
              }}
            />
          </Source>
          <Source
            type='geojson'
            data={sourceRef?.current?.timezoneBoundaryBuilder}
          >
            <Layer
              id='timezone-boundary-builder-fill'
              type='fill'
              paint={{
                'fill-outline-color': '#81452E',
                'fill-color': 'red',
                'fill-opacity': 0
              }}
            />
          </Source>

          <SelectTimeZoneLayer selectTimezoneData={selectTimezoneData} />
          {ianaTimezoneName && (
            <Source
              key={ianaTimezoneName}
              type='geojson'
              data={hoverTimezoneData}
            >
              <Layer
                {...{
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

export default TimezoneMapGL
