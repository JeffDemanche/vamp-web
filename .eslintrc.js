module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    "prettier",
    "eslint:recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended"
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react", "@typescript-eslint", "prettier", "react-hooks"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      typescript: {}
    }
  },
  rules: {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "prettier/prettier": ["error"],
    "react/jsx-uses-react": 1,
    "max-len": [
      2,
      {
        code: 80,
        comments: 120,
        tabWidth: 2,
        ignorePattern: "^import .*",
        ignoreStrings: true
      }
    ],
    "@typescript-eslint/no-empty-function": 0,
    "@typescript-eslint/camelcase": 0
  },
  overrides: [
    {
      files: ["*.test.tsx", "*.test.ts"],
      env: { jest: true },
      plugins: ["jest"],
      rules: {
        "@typescript-eslint/ban-ts-ignore": "off"
      }
    }
  ]
};
