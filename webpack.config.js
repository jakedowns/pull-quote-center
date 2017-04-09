var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: ['./pull-quote-center.js'],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: "pull-quote-center.bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [ 'es2015', 'stage-2' ]
        }
      }
    ]
  },
  plugins: []
}