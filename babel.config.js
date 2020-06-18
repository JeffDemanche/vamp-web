module.exports = function(api) {
  api.cache(true);

  const presets = [
    "@babel/preset-env",
    "@babel/react",
    "@babel/preset-typescript"
  ];

  const plugins = [];

  if (process.env["ENV"] === "test") {
    plugins.push("transform-es2015-modules-commonjs");
  }

  return {
    presets,
    plugins
  };
};
