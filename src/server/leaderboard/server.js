var express = require('express');           // Used to easily direct requests 
var mongojs = require('mongojs');           // Javascript interface to mongodb
var bodyParser = require('body-parser');    // Parses post request data for us
var app = express();
var cryptojs = require('crypto-js');
var ip = require('ip');
// Create mongo connection
//app.db = mongojs('leaderboard', ['stockChartGuru']);

// Tell the app to parse the body of incoming requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// This will be called when a user submits a new score
app.post("/submitScore", (req, res) => {
    console.log('req.body: ', req.body)
    var shouldPost = false;
    if(isSubmitBodyValid(req, res)) {
        if(req.body.gameName === 'stockChartGuru') {
            app.db = mongojs('leaderboard', ['stockChartGuru']);
            console.log('req.body after validation: ', req.body)
            
            var message = `${req.body.score}${req.body.name}`
            var ciphertext = cryptojs.MD5(message + 'function').toString();
            console.log('server cipher ', ciphertext)
            if (ciphertext !== req.body.dateTimeStamp) {
                return;
            }
            if (req.body.score > 10000000000) { // score is probably fake. Greater than 10 billion
                return;
            }

            const score = parseInt(req.body.score);
            console.log(`score: ${score}. date: ${req.body.date}`);

            if(req.body._id) { // If we have a previously submitted _id
                app.db.stockChartGuru.find({}).sort({score:-1}).limit(3000, (err, result) => {
                    shouldPost = true;
                    if(err) {
                        console.log("Failed to find scores: " + err);
                        res.send({error:"Internal Server Error"});
                        shouldPost = false;
                        return;
                    }
                    console.log('result test: ', result)
                    for(var i = 0; i < result.length; i ++){ // Don't insert duplicate _id and scores
                        console.log("Condition", req.body._id, result[i]._id, score, result[i].score, (req.body._id == result[i]._id && score == result[i].score) );
                        if (req.body._id == result[i]._id && score == result[i].score) {
                            shouldPost = false;
                            return;
                        }
                    }
                    
                    if(shouldPost) {
                        console.log('shouldPost: ', shouldPost)
                        const name = req.body.name.slice(0, 14)
                        const obj = { score: score, date: req.body.date, name: name, ip: req.connection.remoteAddress }
                        app.db.stockChartGuru.insert(obj, (err, result) => {
                            if (err) {
                                console.log("Failed to insert score: " + err);
                                res.send({ error: "Internal Server Error" });
                                return;
                            }
                            //console.log('insert result: ', result);
                            res.send({  success: true,
                                        _id: obj._id
                            });
                        });
                    }

                });
            } else { // No previously submitted _id. OK to insert
                const obj = { score: score, date: req.body.date, name: req.body.name, ip: req.connection.remoteAddress }
                        app.db.stockChartGuru.insert(obj, (err, result) => {
                            if (err) {
                                console.log("Failed to insert score: " + err);
                                res.send({ error: "Internal Server Error" });
                                return;
                            }
                            //console.log('insert result: ', result);
                            res.send({  success: true,
                                        _id: obj._id
                            });
                        });
            }
        }
    }
});

// This will be called when a user requests a list of scores
app.post("/highScores", (req, res) => {
    console.log('req.body before validation: ', req.body)

    if (isGetHighScoresBodyValid(req, res)) {
        if(req.body.gameName === 'stockChartGuru') {
            app.db = mongojs('leaderboard', ['stockChartGuru']);
            app.db.stockChartGuru.find({}).sort({score:-1}).limit(3000, (err, result) => {
                if(err) {
                    console.log("Failed to find scores: " + err);
                    res.send({error:"Internal Server Error"});
                    return;
                }
                //console.log('find result: ', result);
                res.send({success:true, highScores:result});
            });
        }
    }
});

isGetHighScoresBodyValid = (req, res) => {
    console.log('req.body during validation: ', req.body)

    if (!req.body.gameName) {
        res.send({ error: "No gameName value was submitted" });
        return false;
    } else {
        return true;
    }
}
isSubmitBodyValid = (req, res) => {
    if (!req.body.gameName) {
        res.send({ error: "No gameName value was submitted" });
        return false;
    }else if (!req.body.score) {
        res.send({ error: "No score value was submitted" });
        return false;
    } else if (!req.body.date) {
        res.send({ error: "No date value was submitted" });
        return false;
    } else if (!req.body.dateTimeStamp) {
        res.send({ error: "No ciphertext value was submitted" });
        return false;
    } else {
        return true;
    }
}

// Test api endpoint
app.post("/postTest", (req, res) => {

    console.log('postTest req.body : ', req.body)
    // var ciphertext = req.body.ciphertext
    // var bytes  = cryptojs.AES.decrypt(ciphertext.toString(), 'secret key 123');
    // var bytes  = cryptojs.AES.decrypt(ciphertext.words, 'secret key 123');

    // var plaintext = bytes.toString(cryptojs.enc.Utf8);

    // console.log('plaintext : ', plaintext)

});

app.post("/andiamo", (req, res) => {
    app.db = mongojs('leaderboard', ['stockChartGuru']);
    var obj = {score: req.body.score}
    app.db.stockChartGuru.remove(obj, (err, result) => {
        if (err) {
            console.log("Failed to remove score: " + err);
            res.send({ error: "Internal Server Error" });
            return;
        }
        res.send({  success: true,
                    _id: obj._id
        });
    });
});

// Get all blog articles
app.get("/blog", (req, res) => {
    app.db = mongojs('blog', ['stockChartGuru']);
    app.db.stockChartGuru.find({}).sort({score:-1}).limit(3000, (err, result) => {
        if(err) {
            console.log("Failed to find scores: " + err);
            res.send({error:"Internal Server Error"});
            return;
        }
        res.send({success:true, result});
    });
});

// Get article by url
app.post("/blog", (req, res) => {
    console.log('req.body: ', req.body)
    if(req.body.url) {
        app.db = mongojs('blog', ['stockChartGuru']);
        app.db.stockChartGuru.findOne({url: req.body.url}, (err, result) => {
            if(err) {
                console.log("Failed to find url: " + err);
                res.send({error:"Internal Server Error"});
                return;
            } else {
                if (result) {
                    res.send({success:true, result});
                } else {
                    res.send({success:false});
                }
            }
        });
    }
});

// Post blog article
app.post("/blog/maverick", (req, res) => {
    console.log('req.body: ', req.body)
    if(req.body.url && req.body.title && req.body.content) {
        const body = {
            url: req.body.url,
            title: req.body.title,            
            content: req.body.content
        }
        app.db = mongojs('blog', ['stockChartGuru']);
        app.db.stockChartGuru.insert(body, (err, result) => {
            if(err) {
                console.log("Failed to insert article: " + err);
                res.send({error:"Internal Server Error"});
                return;
            } else {
                if (result) {
                    res.send({success:true, result});
                } else {
                    res.send({success:false});
                }
            }
        });
    }
});

// app.post("/blog", (req, res) => {
//     console.log('req.body: ', req.body)
//     if(req.body.url) {
//         const article = app.db.stockChartGuru.findOne({url: req.body.url})
//         if (article) {
//             console.log('article: ', article)
//             res.send({success:true, article});
//         } else if(!article) {
//             console.log("Failed to find url: ");
//             res.send({error:"Internal Server Error"});
//             return;
//         }           
//     }
// });

// Start the server
const server = app.listen(3200, () => {
    console.log('Listening on port %d', server.address().port);
});