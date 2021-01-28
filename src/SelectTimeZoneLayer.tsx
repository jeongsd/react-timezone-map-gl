/* eslint-disable spaced-comment, no-unused-vars */

import React, { FC, memo } from 'react'

import MapGL, { NavigationControl, Source, Layer } from 'react-map-gl'

interface SelectTimeZoneLayerProps {
  selectTimezoneData?: any
}

const SelectTimeZoneLayer: FC<SelectTimeZoneLayerProps> = memo((props) => {
  const { selectTimezoneData } = props
  console.log('renderd')

  //   import { feature as topoFeature } from "topojson-client";

  console.log(selectTimezoneData)

  return (
    <Source type='geojson' data={selectTimezoneData}>
      <Layer id='data' type='fill' paint={{ 'fill-color': '#00ff00' }} />
    </Source>
  )
})

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

export default SelectTimeZoneLayer
