const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'production',
  entry: {
    main: './source/js/index.js',
    vendor: './source/js/vendor.js',
  },
  devtool: process.env.NODE_ENV ? false : 'source-map',
  output: {
    path: path.resolve(__dirname, 'build/js'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  optimization: {
    minimizer: [new UglifyJsPlugin({
      sourceMap: false,
      uglifyOptions: {
        warnings: false,
        parse: {},
        compress: {},
        mangle: false,
        output: {
          comments: false,
        },
        toplevel: true,
        nameCache: null,
        keep_fnames: false,
      },
    })],
  },
};
