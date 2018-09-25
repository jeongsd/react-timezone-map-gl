import React from 'react';
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
import Select from '@material-ui/core/Select';
import timezoneMeta from 'moment-timezone/data/meta/latest.json'
import ReactMapGLTimezone from '../../../src'
import TimezoneSelect from '../components/TimezoneSelect'
import Test from '../components/Test'
import '../../../src/index.css'

const styles = theme => ({
  root: {
    // textAlign: 'center',
    marginTop: theme.spacing.unit * 4,
    display: 'flex',
    justifyContent: 'center',
  },
  paper: {
    // textAlign: 'center',
    marginTop: theme.spacing.unit * 7,
  },
});


const zoneKeys = Object.keys(timezoneMeta.zones);
const menuItems = zoneKeys.map(zoneKey => {
  const zone = timezoneMeta.zones[zoneKey];
  return <MenuItem key={zone.name} value={zone.name}>{zone.name}</MenuItem>
})


// console.log();
class Demo1 extends React.Component {
  state = {
    open: false,
    selectTimezone: '',
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleClick = () => {
    this.setState({ open: true });
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const { classes } = this.props;
    const { open, selectTimezone } = this.state;

    // console.log(zoneKeys)
    return (
      <div className={classes.root}>
        <div>
          {/* <Test /> */}
          {/* <div className={classes.timezoneSelectWrapper}> */}
            <TimezoneSelect
              value={selectTimezone}
              onChange={this.handleChange}
            />
          {/* </div> */}


          <Paper elevation={6} className={classes.paper}>
            <ReactMapGLTimezone
              mapboxApiAccessToken="pk.eyJ1IjoiamVvbmdzZCIsImEiOiI2N2EwZjRjZmI5ZjI2OGFiZGVjYTczZTE1NDE4MzEyNyJ9.8TAcw2tyxePaN5zqql8GUA"
            />
          </Paper>
        </div>
      </div>
    );
  }
}

Demo1.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Demo1);