"use strict";
console.time("Startup");
var express = require("express");
var channel = require("./api/routes/channel");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


app.use("/", channel);

var port = process.env.PORT || 10099;

app.listen(port, function () {
    console.timeEnd("Startup");
});

