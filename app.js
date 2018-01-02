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


app.get("/eventlist", (req, res) => {
    res.render("eventlist", {});
    });


app.set('view engine', 'pug')//tells that the file its reading its in pug form
app.set('views', __dirname + '/views');// this is where all the routes are
app.use(express.static(__dirname + '/public')); //this is for all the images and css files
app.use('/user', express.static('public'))
app.use('/event', express.static('public'))

app.use('/', bodyParser.urlencoded({ extended: true }));


client.connect()//this connects to the server


/*--------Searchbar---------*/

app.post("/", (request, response) => {
    fs.readFile('cities.json', function(err, data) {
        if (err) {
            throw err;
        }
        var cityList = JSON.parse(data)
        console.log("JSON data: ", data)
        var allContent = request.body.searchData
        console.log("searchData1: ", allContent)
        var usersSug = []
        debugger
        for (var i = 0; i < cityList.length; i++) {
            if (allContent.toLowerCase() === cityList[i].name.slice(0, allContent.length).toLowerCase() || allContent.toLowerCase() === cityList[i].country.slice(0, allContent.length).toLowerCase()) {
                usersSug.push(cityList[i].name + ", " + cityList[i].country)
            }
        }
        console.log("im here")

        debugger
        // console.log("The suggestions:", usersSug)
        response.json({ status: 200, search: usersSug})
        // request.session.search = allContent
        // response.redirect("/event/activityList")
        // console.log("searchData2: ", allContent)
        // const messageQuery = {
        //     text: ` SELECT * FROM activities WHERE city = '${allContent}';`
        // }
        // // ('${allContent}')
        // if(req.session.user) {
        //     client.query(messageQuery, function (err, response) {
        //         if (err) throw err;
        //         var activities = response.rows
        //         console.log("activities: ", activities)
        //         res.render('activityList', {
        //             user:req.session.user,
        //             search: req.session.search,
        //             activities: activities
        //         })
        //     })    
            
        // }
    });
})


app.use('/user', usersRoutes)/*this is the require route for the usersRoute module
the URL will then be /user/login or /user/signup*/
app.use('/event', events)

/*--------------gets the list from Shell to index--------*/
app.get("/", (req, res) => {
    const readquery1 = {
        text: `create table if not exists activities(
        id serial primary key,
        activity text,
        meetpoint text,
        date date,
        time time,
        city text,
        user_id integer);`
    }

   /* const readquery2 = {
        text: `create table if not exists users(
        id serial primary key,
        username text,
        email text,
        password text);`
    }*/
    client.query(readquery1, /*readquery2*/ function(err, response) {
        /*not needed in 'get'
            only after location is typed in, it should load with ajax/jquery*/
        /*var activity = response.rows*/
        console.log("reached: ")
        res.render('index', {
            user: req.session.user,
            /*activity: activity*/
        })
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
    console.log("Yuurrr")
})

module.exports = client;