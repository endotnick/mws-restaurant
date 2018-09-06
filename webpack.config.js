const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './js/main.js',
    dbhelper: './js/dbhelper.js',
    restaurant_info: './js/restaurant_info.js',
  },
  output: {
    path: path.resolve(__dirname, 'build/js/'),
    filename: '[name].js',
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              'env',
            ],
          },
        },
      },
    ],
  },
};
