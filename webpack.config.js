/* eslint-disable max-len */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: path.join(__dirname, "view", "app.js"),
    module: {
        rules: [{
                test: /\.(graphql|gql)$/,
                exclude: /node_modules/,
                loader: "graphql-tag/loader"
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.(tsx|ts)$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 1,
                            modules: {
                                localIdentName: "[name]__[local]___[hash:base64:5]"
                            }
                        }
                    },
                    "less-loader"
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.(gif|svg|jpg|png)$/,
                use: {
                    loader: "url-loader"
                }
            },
            {
                test: /\.worker\.(js|ts)$/,
                use: {
                    loader: "worker-loader",
                    options: {
                        inline: true
                    }
                }
            }
        ]
    },
    resolve: {
        extensions: ["*", ".mjs", ".js", ".jsx", ".ts", ".tsx"]
    },
    output: {
        path: path.join(__dirname, "public"),
        filename: "vamp.bundle.js"
    },
    plugins: [new CopyWebpackPlugin([{ from: "./favicon.png" }])],
    node: {
        fs: "empty"
    }
};