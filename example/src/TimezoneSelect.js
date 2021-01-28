import React from 'react'
import MenuItem from '@material-ui/core/MenuItem'
import timezoneMeta from 'moment-timezone/data/meta/latest.json'
import Select from 'react-select'

const styles = (theme) => ({
  root: {
    margin: 'auto',
    width: 500
  }
})

const zoneKeys = Object.keys(timezoneMeta.zones).sort()

const timezoneOptions = zoneKeys.map((zoneKey) => {
  const timezone = timezoneMeta.zones[zoneKey].name
  return {
    label: timezone,
    value: timezone
  }
})

class TimezoneSelect extends React.Component {
  itemRenderer = ({ index, style }) => {
    const zone = timezoneMeta.zones[zoneKeys[index]]
    return (
      <MenuItem key={zone.name} value={zone.name}>
        {zone.name}
      </MenuItem>
    )
  }

  render() {
    const { classes, onChange, value } = this.props

    return (
      <Select
        // className={classes.root}
        onChange={onChange}
        value={value}
        options={timezoneOptions}
      />
    )
  }
}

// TimezoneSelect.propTypes = {
//   classes: PropTypes.object.isRequired
// }

export default TimezoneSelect
