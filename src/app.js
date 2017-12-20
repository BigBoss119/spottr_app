const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const fs = require('fs')
const pg = require('pg');
const SQL = require('sql-template-strings');
const Client = pg.Client

//view engine config
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//setting up static files, bodyparser and the session
app.use(express.static(__dirname + '/../public'));
app.use('/', bodyParser.urlencoded({ extended: true }));


app.get("/", (request, response) => {
    response.render("index", {});
    });

app.get("/footer", (request, response) => {
    response.render("footer", {});
    });

app.get("/header", (request, response) => {
    response.render("header", {});
    });


app.listen(3000, ()=>{
    console.log("Miracle happens on port 3000 =] ")
})