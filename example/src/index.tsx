import React from 'react'
import ReactDOM from 'react-dom'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import orange from '@material-ui/core/colors/orange'
import pink from '@material-ui/core/colors/pink'
import CssBaseline from '@material-ui/core/CssBaseline'
import App from './App'

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
  palette: {
    primary: {
      light: orange[300],
      main: orange[500],
      dark: orange[700]
    },
    secondary: {
      light: pink[300],
      main: pink[500],
      dark: pink[700]
    }
  }
})

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </MuiThemeProvider>,
  document.querySelector('#root')
)
