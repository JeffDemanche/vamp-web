import cypressTypeScriptPreprocessor from "./cy-ts-preprocessor";
import { plugins } from "cypress-social-logins";
const { GoogleSocialLogin } = plugins;

export default on => {
  on("file:preprocessor", cypressTypeScriptPreprocessor);
};

export default (on, config) => {
  on("task", {
    GoogleSocialLogin: GoogleSocialLogin
  });
};
