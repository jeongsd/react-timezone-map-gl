import React, { FC, useState, useEffect } from 'react'
import { utcToZonedTime } from 'date-fns-tz'
import Paper from '@material-ui/core/Paper'
import Container from '@material-ui/core/Container'
import Fade from '@material-ui/core/Fade'
import Card from '@material-ui/core/Card'
import Popper, { PopperProps } from '@material-ui/core/Popper'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { SizeMe } from 'react-sizeme'
import TimezoneMapGL from 'react-timezone-map-gl'
import { useInterval } from 'beautiful-react-hooks'
import {
  IntlProvider,
  FormattedRelativeTime,
  FormattedTime,
  FormattedDate
} from 'react-intl'
import TimezoneSelect from './TimezoneSelect'

const Demo1: FC = () => {
  const [source, setSource] = useState<any>(null)
  const [selectTimezone, setSelectTimezone] = useState({
    label: Intl.DateTimeFormat().resolvedOptions().timeZone,
    value: Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const [date, setDate] = useState(() => new Date())

  useInterval(() => {
    setDate(new Date())
  }, 1000)

  const handleChange = (value) => setSelectTimezone(value)

  const [anchorEl, setAnchorEl] = React.useState<PopperProps['anchorEl']>(null)

  const handleTimezoneClick = (event, timezoneName) => {
    setSelectTimezone({
      label: timezoneName,
      value: timezoneName
    })
  }

  useEffect(() => {
    async function loadData() {
      const data = await import('react-timezone-map-gl/dist/timezoneTopo.json')
      setSource(data.default)
    }
    loadData()
  })

  return (
    <IntlProvider locale={navigator.language}>
      <Container>
        <TimezoneSelect value={selectTimezone} onChange={handleChange} />
        <Paper elevation={6}>
          <SizeMe>
            {({ size }) => (
              <TimezoneMapGL
                source={source}
                timezone={selectTimezone && selectTimezone.value}
                mapboxApiAccessToken={
                  process.env.REACT_APP_MAPBOX_TOKEN as string
                }
                onTimezoneClick={handleTimezoneClick as any}
                defaultViewport={{
                  width: size.width,
                  height: ((size?.width || 0) / 27) * 14,
                  zoom: 1.8
                }}
                renderTooltip={({
                  x,
                  y,
                  timeZone,
                  longTimezone,
                  shortTimezone,
                  isUTCTimeOffset
                }) => {
                  const timezoneDate = utcToZonedTime(date, timeZone)
                  return (
                    <Popper
                      style={{
                        pointerEvents: 'none'
                      }}
                      onMouseOver={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      open
                      disablePortal
                      modifiers={{
                        preventOverflow: {
                          enabled: true,
                          boundariesElement: 'scrollParent'
                        }
                      }}
                      anchorEl={{
                        clientHeight: 5,
                        clientWidth: 5,
                        getBoundingClientRect: () => ({
                          top: y,
                          left: x,
                          width: 5,
                          height: 5,
                          bottom: y + 5,
                          right: x + 5
                        })
                      }}
                      transition
                      placement='bottom-start'
                    >
                      {({ TransitionProps }) => (
                        <Fade {...TransitionProps}>
                          <Card>
                            <CardContent>
                              {longTimezone && shortTimezone && (
                                <Typography color='textSecondary' gutterBottom>
                                  {longTimezone} ({shortTimezone})
                                </Typography>
                              )}
                              <Typography variant='h5' component='h2'>
                                {isUTCTimeOffset && 'UTC'}
                                {timeZone}
                              </Typography>
                              <Typography color='textSecondary'>
                                <>
                                  <FormattedDate
                                    month='long'
                                    day='2-digit'
                                    value={timezoneDate}
                                  />{' '}
                                  <FormattedTime
                                    second='numeric'
                                    minute='numeric'
                                    hour='numeric'
                                    value={timezoneDate}
                                  />{' '}
                                  <FormattedRelativeTime
                                    value={Math.floor(
                                      (timezoneDate.getTime() -
                                        new Date().getTime()) /
                                        1000
                                    )}
                                    updateIntervalInSeconds={1}
                                  />
                                </>
                              </Typography>
                            </CardContent>
                          </Card>
                        </Fade>
                      )}
                    </Popper>
                  )
                }}
              />
            )}
          </SizeMe>
        </Paper>
      </Container>
    </IntlProvider>
  )
}
export default Demo1
