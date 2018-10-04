import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { withStyles } from '@material-ui/core/styles';
import reactTimezoneMapGLDemoString from '!raw-loader!../demos/ReactTimezoneMapGLDemo.js';
import SyntaxHighlighter from 'react-syntax-highlighter/prism';
import 'mapbox-gl/dist/mapbox-gl.css';
import withRoot from '../withRoot';
import Demo1 from '../demos/Demo1';



const styles = theme => ({
  root: {
    // textAlign: 'center',
    marginTop: theme.spacing.unit * 10,
    marginBottom: theme.spacing.unit * 10,
  },
  sourceCode: {
    margin: 'auto',
    marginTop: 100,
    maxWidth: 800,
    width: '100%',

  },
  paper: {
    marginTop: 16,
    '& pre': {
      background: 'inherit !important',
    },
  }
});

class Index extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <Typography variant="display2" align="center" gutterBottom>
          react-gl-map-timezone
        </Typography>
        <Demo1 />

        <div className={classes.sourceCode}>
          <Typography variant="display2" align="center" gutterBottom>
            Usage
          </Typography>
          <Paper className={classes.paper}>
            <SyntaxHighlighter language='jsx'>
              {reactTimezoneMapGLDemoString}
            </SyntaxHighlighter>
          </Paper>
        </div>

      </div>
    );
  }
}

Index.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRoot(withStyles(styles)(Index));