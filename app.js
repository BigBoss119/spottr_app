/*--------------------MANDATORY in order to read the file and send info-----------*/
const express = require("express")
require('dotenv').load(); //file that has keywords and usernames "environment variables"
const app = express() //accesing methods in the server side 
const pg = require('pg')  //include the node postgres library
const bodyParser = require("body-parser") //THis allows the info to be read and retreaved (parsing) the data. This must be used
const Client = pg.Client //this is needed to use postgres 
const multer = require("multer")
const fs = require('fs')
const uncaught = require('uncaught')
const session = require('express-session')
var upload = multer({dest: 'images/'})
const SQL = require('sql-template-strings');

const client = new Client({ //this locates the server on the computer
    user: process.env.user,
    host: 'localhost',
    database: 'bulletinboard',
    port: '5432',
    password: process.env.password
}) //then this client is the command connection to the server.
client.connect()
client.query(
    `create table if not exists activities(
    id serial primary key,
    activity text,
    meetpoint text,
    date date,
    time time,
    city text,
    user_id integer);`, (err, response) => {
        if(err) throw err
    }
)
client.query(
    `create table if not exists users(
    id serial primary key,
    username text,
    email text,
    password text);`, (err, response) => {
        if(err) throw err
    }
)
const usersRoutes = require('./routes/usersRoutes') /*route connecting to the users module*/
const events = require('./routes/events')/*route connecting to the events module*/

app.use(session({
    secret: 'secret-session',
    resave: true,
    saveUninitialized: true
}));

app.get("/eventlist", (req, res) => {
    res.render("eventlist", {});
});

app.set('view engine', 'pug')//tells that the file its reading its in pug form
app.set('views', __dirname + '/views');// this is where all the routes are
app.use(express.static(__dirname + '/public')); //this is for all the images and css files
app.use('/user', express.static('public'))
app.use('/event', express.static('public'))

app.use('/', bodyParser.urlencoded({ extended: true }));

/*--------Searchbar---------*/
app.post("/", (request, response) => {
    fs.readFile('cities.json', function(err, data) {
        if (err) throw err;
        
        var cityList = JSON.parse(data)
        var allContent = request.body.searchData
        var usersSug = []
        for (var i = 0; i < cityList.length; i++) {
            if (allContent.toLowerCase() === cityList[i].name.slice(0, allContent.length).toLowerCase() || allContent.toLowerCase() === cityList[i].country.slice(0, allContent.length).toLowerCase()) {
                usersSug.push(cityList[i].name + ", " + cityList[i].country)
            }
        }
        response.json({ status: 200, search: usersSug})
    });
})

app.use('/user', usersRoutes)/*this is the require route for the usersRoute module
the URL will then be /user/login or /user/signup*/
app.use('/event', events)

/*--------------gets the list from Shell to index--------*/
app.get("/", (req, res) => {
    debugger
    res.render('index', {
        user: req.session.user,
    })
})

/*--------connect to your localhost---------*/
app.listen(process.env.webport, function() {
    console.log("Listening on port", process.env.webport)
})

module.exports = client;