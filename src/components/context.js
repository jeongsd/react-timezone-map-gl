import React from 'react';
import { feature as topoFeature } from "topojson-client";

// https://reactjs.org/docs/context.html
export const { Provider, Consumer } = React.createContext();

export function withSource(Component) {
  return function InjectedTimezoneSourceComponent(props) {
    return (
      <Consumer>
        {source => (
          <Component {...props} source={{
            naturalEarth: topoFeature(
              source.naturalEarth, 
              source.naturalEarth.objects.ne_10m_time_zones
            ),
            timezoneBoundaryBuilder: topoFeature(
              source.timezoneBoundaryBuilder, 
              source.timezoneBoundaryBuilder.objects.combined_shapefile
            ),
          }} />
        )}
      </Consumer>
    );
  };
}

