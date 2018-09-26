import React from 'react';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
// import Select from '@material-ui/core/Select';
import timezoneMeta from 'moment-timezone/data/meta/latest.json'
import Select from 'react-select';

// import VirtualList from 'react-virtual-list';
// import VirtualList from 'react-tiny-virtual-list';

import ReactMapGLTimezone from '../../../src'
import '../../../src/index.css'

const styles = theme => ({
  // root: {
  //   // textAlign: 'center',
  //   marginTop: theme.spacing.unit * 4,
  //   display: 'flex',
  //   justifyContent: 'center',
  // },
  // paper: {
  //   // textAlign: 'center',
  //   marginTop: theme.spacing.unit * 3,
  // },
  root: {
    margin: 'auto',
    width: 500,
  },
});


const zoneKeys = Object.keys(timezoneMeta.zones).sort();

const options = zoneKeys.map(zoneKey => {
  const timezone = timezoneMeta.zones[zoneKey].name;
  return {
    label: timezone,
    value: timezone,
  };
});
// const options = [
//   { value: 'chocolate', label: 'Chocolate' },
//   { value: 'strawberry', label: 'Strawberry' },
//   { value: 'vanilla', label: 'Vanilla' }
// ]
// const menuItems = zoneKeys.map(zoneKey => {
//   const zone = timezoneMeta.zones[zoneKey];
//   return <MenuItem key={zone.name} value={zone.name}>{zone.name}</MenuItem>
// })


const formatGroupLabel = zoneKey => {
  const zone = timezoneMeta.zones[zoneKey];
  // console.log(zoneKey)
  return (
    <MenuItem key={zone.name} value={zone.name}>
      {zone.name}
    </MenuItem>
  );
}

class TimezoneSelect extends React.Component {

  itemRenderer = ({ index, style }) => {
    const zone = timezoneMeta.zones[zoneKeys[index]];
    return <MenuItem key={zone.name} value={zone.name}>{zone.name}</MenuItem>
  }

  render() {
    const { classes, onChange, value } = this.props;
    // console.log(value)
    return (
      <Select
        className={classes.root}
        onChange={onChange}
        value={value}
        options={options}
      />
    );
  }
}

TimezoneSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default compose(
  // withProps({
  //   // For <VirtualList /> HOC Props
  //   items: zoneKeys,
  //   itemHeight: 100,
  // }),
  withStyles(styles),
  // VirtualList(),
)(TimezoneSelect);
