const Dotenv = require('dotenv-webpack');

module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false
  },
  webpack: {
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
