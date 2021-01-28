import React, { FC, useState, useEffect } from 'react'
import Paper from '@material-ui/core/Paper'
import { SizeMe } from 'react-sizeme'
import TimezoneMapGL from 'react-timezone-map-gl'
//
// import timezoneTopo from
import TimezoneSelect from './TimezoneSelect'

const Demo1: FC = () => {
  const [source, setSource] = useState<any>(null)
  const [selectTimezone, setSelectTimezone] = useState({
    label: Intl.DateTimeFormat().resolvedOptions().timeZone,
    value: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const handleChange = (value) => setSelectTimezone(value)

  const handleTimezoneClick = (event, timezoneName) => {
    setSelectTimezone({
      label: timezoneName,
      value: timezoneName
    })
  }

  useEffect(() => {
    async function loadData() {
      const a = await import('react-timezone-map-gl/dist/timezoneTopo.json')
      setSource(a.default)
    }
    loadData()
  })

  return (
    <div>
      <div>
        <TimezoneSelect value={selectTimezone} onChange={handleChange} />
        <Paper elevation={6}>
          <SizeMe>
            {({ size }) => (
              <TimezoneMapGL
                source={source}
                timezone={selectTimezone && selectTimezone.value}
                // mapboxApiAccessToken={process.env.MAPBOX_TOKEN}
                mapboxApiAccessToken='pk.eyJ1IjoiamVvbmdzZCIsImEiOiJjam1qcWxoY28wOTJmM3ZvZjBpbnB4aDNnIn0.kwjRZsFwP5Pqian_w5hA_Q'
                onTimezoneClick={handleTimezoneClick as any}
                defaultViewport={{
                  width: size.width,
                  height: ((size?.width || 0) / 27) * 14,
                  zoom: 1.8
                }}
              />
            )}
          </SizeMe>
          {/* <Provider value={timezoneTopo}>
          </Provider> */}
        </Paper>
      </div>
    </div>
  )
}
export default Demo1
