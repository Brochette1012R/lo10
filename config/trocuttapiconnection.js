let request = require('request')
request.db = "trocutt/"
request.url = 'http://ec2-52-208-39-104.eu-west-1.compute.amazonaws.com:5984/'
module.exports = request