import React from 'react';

// https://reactjs.org/docs/context.html
export const { Provider, Consumer } = React.createContext();

export function withSource(Component) {
  return function InjectedTimezoneSourceComponent(props) {
    return (
      <Consumer>
        {source => <Component {...props} source={source} />}
      </Consumer>
    );
  };
}

