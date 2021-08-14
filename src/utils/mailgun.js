const keys = require("../core/config")
const mailgun = require('mailgun-js');
const msg = mailgun({ apiKey: keys.MAILGUN_APIKEY, domain: keys.MAILGUN_DOMAIN });

module.exports = msg