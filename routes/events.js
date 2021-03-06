const express = require("express")
require('dotenv').load(); //file that has keywords and usernames "environment variables"
const pg = require('pg')  //include the node postgres library
const bodyParser = require("body-parser") //THis allows the info to be read and retreaved (parsing) the data. This must be used
const multer = require("multer")
const session = require('express-session')
var upload = multer({dest: 'images/'})
const bcrypt = require("bcrypt")
const router = require('express').Router()
const Client = pg.Client //this is needed to use postgres 
const client = new Client({ //this locates the server on the computer
    user: process.env.user,
    host: 'localhost',
    database: 'bulletinboard',
    port: '5432',
    password: process.env.password
}) //then this client is the command connection to the server.

client.connect()//this connects to the sesrver

router.get("/createActivity", (req, res) => {
    debugger
    if(!req.session.user) res.redirect("/user/login")
    else {
        res.render('createActivity', {
            user: req.session.user
        })
    }
})

router.post("/createActivity", (req, res) => {
    var activity = req.body.activity
    var meetpoint = req.body.meetpoint
    var todo = req.body.description
    var date = req.body.date
    var time = req.body.time
    var city = req.body.city
    console.log(req.session.user.username)
    const insertquery = {
        text: `INSERT INTO activities (activity, meetpoint, todo, date, time, city, user_id) 
        values 
        ('${activity}','${meetpoint}','${todo}','${date}','${time}','${city}', 
        (SELECT users.id FROM users WHERE username = '${req.session.user.username}')) RETURNING *;`
    }
    console.log("This is: " + req.session.user.username)
    client.query(insertquery, function (err, response) { 
        if(err) console.log("ERROR", err)
        res.render('activityList',{ 
            user:req.session.user,
            activities: response.rows
        })
       // res.redirect('/user/profile')
        })
})
/*-----navbar---*/
router.get("/activityList", (req, res) => {
    var search = req.session.search
    console.log("searchData3: ", search)
    const messageQuery = {
        text: `SELECT * FROM activities WHERE city = '${search}';`
    }
    // ('${allContent}')
    if(req.session.user) {
        client.query(messageQuery, function (err, response) {
            if (err) throw err;
            var activities = response.rows
            console.log("activities: ", activities)
            res.render('activityList', {
                user:req.session.user,
                search: req.session.search,
                activities: activities
            })
        })    
        
    }
})

/*-----searchbar----*/
router.post("/activityList", (req, res) => {
    var allContent = req.body.searchData
    req.session.search = allContent
    console.log("searchData2: ", allContent)
    const messageQuery = {
        text: `SELECT * FROM activities WHERE city LIKE '${allContent.slice(0, (allContent.length - 4))}%';`
    } /* {allContent}% matches any values that starts with "allContent"*/
    debugger
/*    if(req.session.user) {
*/        client.query(messageQuery, function (err, response) {
            if (err) throw err;     
            var activities = response.rows
           debugger
            res.json(
               activities
            )
        })    
        
    //}
})
    
module.exports = router;