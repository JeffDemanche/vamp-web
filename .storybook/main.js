const path = require("path");
const SRC_PATH = path.join(__dirname, '../view');

module.exports = {
    stories: ['../view/**/*.stories.(jsx|tsx)'],
    addons: ['@storybook/addon-actions', '@storybook/addon-links'],
    webpack: async config => {
        config.module.rules.push({
            test: /\.(ts|tsx)$/,
            use: "ts-loader"
        });
        config.module.rules.push({
            test: /\.less$/i,
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
        });
        config.resolve.extensions.push(".ts", ".tsx");
        return config;
    },
};