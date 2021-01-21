const path = require("path");
const SRC_PATH = path.join(__dirname, '../view');

const custom = require('../webpack.config.js');

module.exports = {
    stories: ['../view/**/*.stories.@(js|mdx|tsx|ts)'],
    addons: ['@storybook/addon-actions', '@storybook/addon-links', 'storybook-addon-apollo-client'],
    typescript: {
        check: false,
        checkOptions: {},
        reactDocgen: 'react-docgen-typescript',
        reactDocgenTypescriptOptions: {
            shouldExtractLiteralValuesFromEnum: true,
            propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
        },
    },
    webpackFinal: (config) => {
        return { ...config, module: { ...config.module, rules: custom.module.rules } };
    },
};