const cypressTypeScriptPreprocessor = require('./cy-ts-preprocessor')
const {GoogleSocialLogin} = require('cypress-social-logins').plugins

module.exports = on => {
  on('file:preprocessor', cypressTypeScriptPreprocessor)
}

module.exports = (on, config) => {
  on('task', {
    GoogleSocialLogin: GoogleSocialLogin
  })
}