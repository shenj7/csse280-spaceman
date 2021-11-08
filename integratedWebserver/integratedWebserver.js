const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { response } = require("express");
const { RSA_NO_PADDING } = require("constants");

// Setup
const app = express();
app.use('/', express.static("public"));
app.use('/api/', bodyParser.urlencoded({
    extended: true
}));
app.use('/api/', bodyParser.json());

// Data from a file.
let data = [];
const serverSideStorage = "../data/db.json";
fs.readFile(serverSideStorage, function (err, buf) {
    if (err) {
        console.log("error: ", err);
    } else {
        data = JSON.parse(buf.toString());
    }
    console.log("Data read from file.");
});

function saveToServer(data) {
    fs.writeFile(serverSideStorage, JSON.stringify(data), function (err, buf) {
        if (err) {
            console.log("error: ", err);
        } else {
            console.log("Data saved successfully!");
        }
    })
}

// ------------------------------------------------------------------------
// Admin API - Note: the Admin api tells you words.  You are an admin.
// ------------------------------------------------------------------------

/**
 * Create - Add a word to the word list (i.e. the data array)
 *   method:                    POST
 *   path:                      /api/admin/add
 *   expected request body:     {"word": "..."}
 *   side effects:              saves the word onto the data array
 *   response:                  {"word": "...", "index": #}
 */


app.post("/api/admin/add", (req, res) => {
    data.push(req.body.word);
    saveToServer(data);
    res.send(JSON.stringify({"word": req.body.word}))
    res.end();
});

/**
 * Read all	- Get all words
 *   method:                    GET
 *   path:                      /api/admin/words
 *   expected request body:     none
 *   side effects:              none (as is the case for all GETs)
 *   response:                  {"words": ["...", "..."], "length": #}
 */


app.get("/api/admin/words", (req, res) => {
    res.send(JSON.stringify({"words":data}));
    res.end();
});


/**
 *  Read one - Get a single word at index
 *    method:                    GET
 *    path:                      /api/admin/word/:id
 *    expected request body:     none (notice the path parameter instead)
 *    side effects:              none (as is the case for all GETs)
 *    response:                  {"word": "...", "index": #}
 */


app.get("/api/admin/word/:id", (req, res) => {
    const word = parseInt(req.params.id);
    res.send(JSON.stringify({"word":data[word]}));
    res.end();
});

/**
 *  Update - Update a word at index
 *    method:                    PUT
 *    path:                      /api/admin/word/:id
 *    expected request body:     {"word": "..."} (notice the path parameter is also present)
 *    side effects:              saves the new word into that location in the data array
 *    response:                  {"word": "...", "index": #}
 */


app.put("/api/admin/word/:id", (req, res) => {
    let word = parseInt(req.params.id);
    let newWord = req.body.word;
    data[word] = newWord||"penis";
    saveToServer(data);
    res.end();
});

/**
 *  Delete
 *    method:                    DELETE
 *    path:                      /api/admin/word/:id
 *    expected request body:     none (notice the path parameter instead)
 *    side effects:              deletes the new word at that index from the data array
 *    response:                  {"index": #}  (i.e. the index that got deleted)
 */


app.delete("/api/admin/word/:id", (req, res) => {
    const word = parseInt(req.params.id);
    // data.splice(word);
    data[word] = null;
    data.splice(word, 1);
    saveToServer(data);
    res.end();
});


// ------------------------------------------------------------------------
// Player API - Never shares the word. It is a secret.
// ------------------------------------------------------------------------
/**
 *  Num Words - Get the number of words (i.e. the size of the data array).
 *    method:                    GET
 *    path:                      /api/player/numwords
 *    expected request body:     none
 *    side effects:              none (as is the case for all GETs)
 *    response:                  {"length": #}
 */


app.get("/api/player/numwords", (req, res) => {
    res.send(JSON.stringify({"length": data.length}));
});

/**
 *  Word Length - Get the length of a single word at the given index.
 *    method:                    GET
 *    path:                      /api/player/wordlength/:id
 *    expected request body:     none (notice the path parameter instead)
 *    side effects:              none (as is the case for all GETs)
 *    response:                  {"length": #, "index": #}
 */


app.get("/api/player/wordlength/:id", (req, res) => {
    res.send(JSON.stringify({
        "length": data[req.params.id].length,
        "index": req.params.id
    }))
});

/**
 *  Guess - Allow the player to make a guess and return where that letter is found in the word.
 *    method:                    GET
 *    path:                      /api/player/guess/:id/:letter
 *    expected request body:     none (notice multiple path parameters instead)
 *    side effects:              none (as is the case for all GETs)
 *    response:                  {"letter": ".", "length": #, "index": #, "locations": [#, #, #]}
 *     example real response:    {"letter": "A", "length": 6, "index": 7, "locations": [0]}
 *     notice the length and index are repeat info like Word Length would give.
 *     the interesting field is locations which is always an array, but could be an empty array [].
 */


app.get("/api/player/guess/:id/:letter", (req, res) => {
    const word = data[req.params.id];
    const letter = req.params.letter;
    
    let locations = [];
    for (let x = 0; x < word.length; x++) {
        if (word.toUpperCase().charAt(x) == letter) {
            locations.push(x);
        }
    }

    res.send(JSON.stringify({
        "letter": letter,
        "length": word.length,
        "index": req.params.id,
        "locations": locations,
    }))
});


app.listen(3000);