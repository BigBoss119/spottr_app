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

const usersRoutes = require('./routes/usersRoutes') /*route connecting to the users module*/
const events = require('./routes/events')/*route connecting to the events module*/



app.use(session({
    secret: 'secret-session',
    resave: true,
    saveUninitialized: true
}));


app.get("/eventlist", (request, response) => {
    response.render("eventlist", {});
    });


app.set('view engine', 'pug')//tells that the file its reading its in pug form
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// app.use(express.static('public'))
app.use('/', bodyParser.urlencoded({ extended: true }));


client.connect()//this connects to the server


/*--------Searchbar---------*/

app.post("/", (request, response) => {
    console.log("at the post office")
    fs.readFile('cities.json', function(err, data) {
        if (err) {
            throw err;
        }
        var userList = JSON.parse(data)
        var allContent = request.body.searchData
        var usersSug = []
        debugger
        for (var i = 0; i < userList.length; i++){
            if (allContent.toLowerCase() === userList[i].name.slice(0, allContent.length).toLowerCase() || allContent.toLowerCase() === userList[i].country.slice(0, allContent.length).toLowerCase()){
                usersSug.push(userList[i].name + ", " + userList[i].country
                )
                console.log("User found")
            }
            console.log(userList[i].name)
        } 
        debugger
        console.log("The suggestions:", usersSug)
        response.json({status:200, search: usersSug})
        // response.status(200).send({search: usersSug})
});
})


app.use('/user', usersRoutes)/*this is the require route for the usersRoute module
the URL will then be /user/login or /user/signup*/
app.use('/event', events)

/*--------------gets the list from Shell to index--------*/
app.get("/", (req, res) => {
    const readquery = {
        text: `select * from messages;`
    }
    client.query(readquery, function(err, response) {
        var message = response.rows
        // console.log(message)
        res.render('index', {user: req.session.user, message: message })
    })
})

// // Error handling
// app.use(function(req, res, next) {
//   const error = new Error('Not found');
//   error.status = 404;
//   next(error);
// });

// app.use(function(error, req, res, next) {
//   res.status(error.status || 500);
//   res.render('error', {error: error})
// });


/*--------connect to your localhost---------*/
app.listen(3000, function() {
    console.log("App on port 3000")
})

module.exports = client;