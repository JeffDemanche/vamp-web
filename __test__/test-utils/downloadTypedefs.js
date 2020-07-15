/* eslint-disable prettier/prettier */
// downloadTypeDefs.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { fetchTypeDefs } = require("apollo-mocked-provider");

(() => {
    fetchTypeDefs({ uri: "http://localhost:4567/graphql" });
})();