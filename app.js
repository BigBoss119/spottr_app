/*--------------------MANDATORY in order to read the file and send info-----------*/
const express = require("express")
require('dotenv').load(); //file that has keywords and usernames "environment variables"
const app = express() //accesing methods in the server side 
const session = require('express-session')
const pg = require('pg')  //include the node postgres library
const bodyParser = require("body-parser") //THis allows the info to be read and retreaved (parsing) the data. This must be used
app.use(bodyParser.urlencoded()) 
const Client = pg.Client //this is needed to use postgres 
const bcrypt = require("bcrypt")
const multer = require("multer")
var upload = multer({dest: 'images/'})
const client = new Client({ //this locates the server on the computer
    user: process.env.user,
    host: 'localhost',
    database: 'bulletinboard',
    port: '5432',
    password: process.env.password
}) //then this client is the command connection to the server.

app.use(session({
    secret: 'secret-session',
    resave: true,
    saveUninitialized: true
}));

client.connect()//this connects to the sesrver


app.set('view engine', 'pug')//tells that the file its reading its in pug form

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


/*--------signup user and register to shell-------*/
app.get("/signup", (req, res) => {
    if(req.session.user) {
        res.send("You are already logged in")
    }
    else {
        res.render('signup')
    }
})

app.post("/signup", (req, res) => {
    var username = req.body.username /*case insensitive*/
    var email = req.body.email /*case insensitive*/
    var password = req.body.password
    console.log(password)
    const userquery = {
        text: `SELECT * FROM users WHERE username = '${username}'`
    }
    client.query(userquery)
        .then(result => {
            /*username, email taken*/
            if (result.rows.length !== 0) {
                console.log("User: " + result.rows[0])
                res.send("Username already taken")
            } else {
                debugger
                /*bcrypt password(hash and salt)*/
                var salt = bcrypt.genSalt(10, function(err, salt) { /*you have to create the salt and then add it to the bcrypt*/
                    bcrypt.hash(`${req.body.password}`, salt, function(err, hash) {
                        client.query(`INSERT INTO users (username, email, password) values ('${username}','${email}','${hash}') RETURNING *;`)
                        .then(response => {
                            console.log(response)
                            req.session.user = {
                                username:  response.rows[0].username,
                                id: response.rows[0].id
                            }
                            res.redirect('/profile')
                        })
                        .catch(e=>{
                            console.log("ERRORsingup ", e)
                        })
                                               
                    })
                })
                
            }

        })
        .catch(error => {
            console.log("You fucked up!!: " + error)
        })
})

/*-------Login------*/

app.get("/login", (req, res) => {
    res.render('login', {
        user:req.session.user
    })
})

app.post('/login', (req, res) => {
    var username = req.body.username
    // var email = req.body.email.toLowerCase() /*case insensitive*/
    // var password = req.body.password
    const loginQuery = {
        text: ` SELECT * FROM users WHERE username = '${username}';`
    } 
    
    client.query(loginQuery, function (err, response) {
        if (err) throw err
        if(response.rows.length === 0) {
            res.redirect('/signup')
        } else {
            bcrypt.compare(req.body.password /*the typed password*/, response.rows[0].password /*password in DB*/, function(err, result) {
                if(err) throw err
                if (result == true) {
                    req.session.user = {
                        username:  response.rows[0].username,
                        id: response.rows[0].id
                        } 
                        console.log(req.session.user)
                    res.redirect('/profile')
                } else {
                    res.send("Wrong password")
                }
                
                
                });
        }  
    })
})

app.post('/logout', function (req, res) {
  req.session.destroy();
  console.log("Logged Out")
  res.render('index');
});

/*------post message adn send to shell------*/
app.get("/postmessage", (req, res) => {
    res.render('postmessage', {
        user: req.session.user
    })
})

app.post("/postmessage", (req, res) => {
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
        res.redirect('/profile')
        })
   
    // res.render('bulletin')
})


app.get("/bulletin", (req, res) => {
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
        res.redirect('/login')
    }
    
})

app.get("/profile", (req, res) => {
    console.log("This is: ", req.session.user)
    console.log(req.session.user.id)
    const profileQuery = {
        text: `Select messages.title, messages.message FROM messages WHERE messages.user_id = ${req.session.user.id}`
    } 
    
    if(req.session.user) {
        client.query(profileQuery, function (err, response) {
            if(err) throw err;
            var messages = response.rows
            console.log(messages)
            res.render('profile', {
                user:req.session.user,
                messages:messages
            })
        })
    } 
    else {
        res.redirect('/signup')
    }
    
})

// app.post("/profile", upload.single("file"), (req, res, next) => {
//     const picQuery = {
//         text: ` INSERT INTO images(variable) VALUES ('${req.file.originalname}')`
//     }
//     client.query(picQuery, function (err, res) {
//         if (err) throw err
//             res.render('profile', {
//                 user:req.session.user,
//                 messages:messages
//             })
//     })
// })

/*--------connect to your localhost---------*/
app.listen(3000, function() {
    console.log("yuurr")
})
