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

router.get("/postmessage", (req, res) => {
    res.render('postmessage', {
        user: req.session.user
    })
})

router.post("/postmessage", (req, res) => {
    var title = req.body.title
    var message = req.body.message
    var password = req.body.password
    const insertquery = {
        text: `INSERT INTO messages (title, message, user_id) values ('${title}','${message}', (SELECT users.id FROM users WHERE username = '${req.session.user.username}'));`
    }
    console.log("This is: " + req.session.user.username)
    client.query(insertquery, function (err, response) { 
        if(err) {
            console.log("ERROR", err)
        }
        res.redirect('/user/profile')
        })
   
    // res.render('bulletin')
})

router.get("/bulletin", (req, res) => {
    const messageQuery = {
        text: ` SELECT * FROM messages;`
    }

    if(req.session.user) {
        client.query(messageQuery, function (err, response) {
            if (err) throw err;
            var messages = response.rows
            res.render('bulletin', {
                user:req.session.user,
                messages:messages
            })
        })    
        
    }
    else {
        res.redirect('/user/login')
    }
    
})
module.exports = router;