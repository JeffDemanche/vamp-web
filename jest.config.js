module.exports = {
  preset: "ts-jest",
  verbose: true,
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "\\.(js|ts|tsx)$": "ts-jest",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__test__/test-utils/file-transformer.js"
  },
  testRegex: "/__test__/.*\\.(test|spec)?\\.(ts|tsx)$",
  transformIgnorePatterns: ["[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$"],
  snapshotSerializers: ["enzyme-to-json"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__test__/test-utils/__mocks__/file-mock.js",
    "\\.(css|less)$": "identity-obj-proxy"
  },
  setupFiles: ["<rootDir>/jest-setup.ts"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"]
};
