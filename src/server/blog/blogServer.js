var express = require('express');           // Used to easily direct requests 
var mongojs = require('mongojs');           // Javascript interface to mongodb
var bodyParser = require('body-parser');    // Parses post request data for us
var app = express();
var ip = require('ip');
// Create mongo connection
//app.db = mongojs('leaderboard', ['stockChartGuru']);

// Tell the app to parse the body of incoming requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// This will be called when a user requests a list of scores
app.get("/", (req, res) => {
    console.log('INSIDE');

    app.db = mongojs('blog', ['stockChartGuru']);
    app.db.stockChartGuru.find({}).sort({score:-1}).limit(3000, (err, result) => {
        if(err) {
            console.log("Failed to find scores: " + err);
            res.send({error:"Internal Server Error"});
            return;
        }
        console.log('find result: ', result);
        res.send({success:true, highScores:result});
    });
});

// Start the server
const server = app.listen(3300, () => {
    console.log('Listening on port %d', server.address().port);
});