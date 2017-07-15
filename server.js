var express = require('express')
var app = express()

app.use('/', express.static(__dirname))
console.log('dir: ', __dirname)
app.listen(3100, function() { console.log('listening')})
