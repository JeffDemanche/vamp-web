const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
    entry: path.join(__dirname, "view", "app.js"),
    module: {
        rules: [
          {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader"
            }
          },
          {
            test: /\.less$/i,
            use: ['style-loader', {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: {
                  localIdentName: "[name]__[local]___[hash:base64:5]",
              },
              }
            }, 'less-loader'],
          },
          {
            test: /\.(gif|svg|jpg|png)$/,
            use: {
              loader: 'url-loader'
            }
          }
        ],
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    output: {
        path: path.join(__dirname, "view/build"),
        filename: "vamp.bundle.js",
    }, 
    plugins: isProduction ? [new MiniCssExtractPlugin()] : []
};