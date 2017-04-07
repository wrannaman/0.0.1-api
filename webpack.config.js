// const path = require('path');
// const HtmlWebpackPlugin = require('html-webpack-plugin');
//
// const HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
//   template: './client/index.html',
//   filename: 'index.html',
//   inject: 'body'
// });
// module.exports = {
//   entry: './client/index.js',
//   output: {
//     path: path.resolve('dist'),
//     filename: 'index_bundle.js'
//   },
//   module: {
//     loaders: [
//       { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/ },
//       { test: /\.jsx$/, loader: 'babel-loader', exclude: /node_modules/ }
//     ]
//   },
//   plugins: [HtmlWebpackPluginConfig]
// };
console.log('dirname ? ', __dirname);
module.exports = {
  entry: './client/index.js',
  output: {
    path: __dirname + '/build',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.jsx', '.js', '.json'],
    modules: [
      'client',
      'node_modules',
    ],
  }
};
