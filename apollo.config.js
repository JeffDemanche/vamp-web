// https://www.apollographql.com/docs/devtools/apollo-config/
module.exports = {
  client: {
    includes: ["./view/**/*.ts", "./view/**/*.tsx"],
    excludes: ["./tests/*", "./public/*"],
    service: {
      name: "vamp-server",
      url: "http://localhost:4567/graphql",
      skipSSLValidation: true
    }
  }
};
