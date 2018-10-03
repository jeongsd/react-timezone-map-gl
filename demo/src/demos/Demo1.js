import React from 'react';
import PropTypes from 'prop-types';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import { SizeMe } from 'react-sizeme';
import TimezoneMapGL, { Provider } from 'react-timezone-map-gl';
import timezoneTopo from 'react-timezone-map-gl/data/timezoneTopo.json';
import TimezoneSelect from '../components/TimezoneSelect';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 4,
  },
  paper: {
    margin: 'auto',
    marginTop: theme.spacing.unit * 7,
    width: '100%',
    maxWidth: 'calc(100% - 256px)',
  },
});

class Demo1 extends React.Component {
  state = {
    selectTimezone: {
      label: Intl.DateTimeFormat().resolvedOptions().timeZone,
      value: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
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
            <Provider value={timezoneTopo}>
              <SizeMe>
                {({ size }) => (
                  <TimezoneMapGL
                    selectTimezone={selectTimezone && selectTimezone.value}
                    mapboxApiAccessToken={process.env.MAPBOX_TOKEN}
                    onTimezoneClick={this.handleTimezoneClick}
                    defaultViewport={{
                      width: size.width,
                      height: size.width / 27 * 14,
                      zoom: 1.8,
                    }}
                  />
                )}
              </SizeMe>
            </Provider>
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