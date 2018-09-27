import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import TimezoneMapGL from '../../../src'
import TimezoneSelect from '../components/TimezoneSelect'
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

const mapboxApiAccessToken = 'pk.eyJ1IjoiamVvbmdzZCIsImEiOiJjam1qcWxoY28wOTJmM3ZvZjBpbnB4aDNnIn0.kwjRZsFwP5Pqian_w5hA_Q';
class Demo1 extends React.Component {
  state = {
    selectTimezone: null,
  };

  handleChange = value => this.setState({ selectTimezone: value })

  handleTimezoneClick = (event, timezoneName) => {
    this.setState({ selectTimezone: {
      label: timezoneName,
      value: timezoneName
    } })
  }

  render() {
    const { classes } = this.props;
    const { selectTimezone } = this.state;

    return (
      <div className={classes.root}>
        <div>

          <TimezoneSelect
            value={selectTimezone}
            onChange={this.handleChange}
          />
          <Paper elevation={6} className={classes.paper}>
            <TimezoneMapGL
              selectTimezone={selectTimezone && selectTimezone.value}
              mapboxApiAccessToken={mapboxApiAccessToken}
              onTimezoneClick={this.handleTimezoneClick}
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