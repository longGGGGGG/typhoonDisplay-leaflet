'use strict';
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = 8083;
const HOST = "0.0.0.0";

app.use(express.static("./"));
app.get('/', function (req, res) {
    console.log(req.url);
    console.log("here");
    res.send('Hello World!');
})

app.get("/index", function (request, response) {
    console.log(request.url);
    fs.readFile(path.join(__dirname, "/index.html"), 'utf8', function (err, data) {
        // body 
        if (err) {
            console.log(err); //404：NOT FOUND 
            response.writeHead(404, { "Content-Type": "text/html" });
        } else {
            //200：OK 
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(data.toString());
        }
        response.end();
    });
});

app.listen(PORT, HOST);
console.log(`Runnning on http://${HOST}:${PORT}`);
