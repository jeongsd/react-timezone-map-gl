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

const timezoneOptions = zoneKeys.map(zoneKey => {
  const timezone = timezoneMeta.zones[zoneKey].name;
  return {
    label: timezone,
    value: timezone,
  };
});

// https://en.wikipedia.org/wiki/List_of_UTC_time_offsets
// var headline = document.getElementsByClassName('mw-headline')
// var result = []

// for (let index = 0; index < headline.length; index++) {
//   var element = headline[index];
//   console.log(element)
//   if(element.children[0]) {
//     result.push(element.children[0].title)
//   }

// }

// console.log(JSON.stringify(result))

const fixedOffsets = [
  "UTC−12:00","UTC−11:00","UTC−10:00","UTC−09:30","UTC−09:00","UTC−08:00","UTC−07:00","UTC−06:00","UTC−05:00","UTC−04:00","UTC−03:30","UTC−03:00","UTC−02:00","UTC−01:00","UTC±00:00","UTC+01:00","UTC+02:00","UTC+03:00","UTC+03:30","UTC+04:00","UTC+04:30","UTC+05:00","UTC+05:30","UTC+05:45","UTC+06:00","UTC+06:30","UTC+07:00","UTC+08:00","UTC+08:45","UTC+09:00","UTC+09:30","UTC+10:00","UTC+10:30","UTC+11:00","UTC+12:00","UTC+12:45","UTC+13:00","UTC+14:00"
].map(offset => ({ label: offset, value: offset }))

const groupedOptions = [
  {
    label: 'Fixed offset',
    options: fixedOffsets,
  },
  {
    label: 'IANA',
    options: timezoneOptions,
  },
];

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
        options={groupedOptions}
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
