const Dotenv = require('dotenv-webpack');

module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false
  },
  webpack: {
    // copy: [
    //   // Copy directory contents to output
    //   { from: 'src/data' }
    // ],
    extra: {
      plugins: [
        new Dotenv()
      ]
    }
  },
  babel: {
    plugins: [
      'styled-components',
      ['module-resolver', {
        'root': ['.'],
        'alias': {
          'react-timezone-map-gl': './src'
        },
      }],
    ],
  },

}
