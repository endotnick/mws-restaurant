const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/js/main.js',
    restaurant_info: './src/js/restaurant_info.js',
    sw: './src/js/sw.js',
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
