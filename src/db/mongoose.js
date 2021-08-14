
if(process.env.NODE_ENV === "development") {
  module.exports = require("../config/development")
}

if(process.env.NODE_ENV === "production") {
  module.exports = require("../config/production")
}

if(process.env.NODE_ENV === "test") {
  module.exports = require("../config/testDB")
}