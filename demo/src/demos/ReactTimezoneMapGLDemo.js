import React from 'react';
import TimezoneMapGL, { Provider } from 'react-timezone-map-gl'
import timezoneTopoJSON from 'react-timezone-map-gl/data/timezoneTopo';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

class ReactTimezoneMapGLDemo extends React.Component {
  state = {
    timezone: null,
  };

  handleTimezoneClick = (event, timezoneName) => {
    this.setState({ timezone: timezoneName })
  }

  render() {
    const { timezone } = this.state;

    return (
      <Provider value={timezoneTopoJSON}>
        <TimezoneMapGL
          timezone={timezone}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          onTimezoneClick={this.handleTimezoneClick}
          defaultViewport={{
            width: 1000,
            height: 1000 / 27 * 14,
            zoom: 1.5,
          }}
        />
      </Provider>
    );
  }
}

export default ReactTimezoneMapGLDemo;