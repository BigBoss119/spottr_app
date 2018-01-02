const bcrypt = require("bcrypt")
const session = require('express-session')
const router = require('express').Router()
//const client = require('../app')
const pg = require('pg')  //include the node postgres library
const Client = pg.Client //this is needed to use postgres 
const client = new Client({ //this locates the server on the computer
    user: process.env.user,
    host: 'localhost',
    database: 'bulletinboard',
    port: '5432',
    password: process.env.password
}) //then this client is the command connection to the server.



client.connect()//this connects to the sesrver

router.get("/signup", (req, res) => {
    if(req.session.user) {
        res.send("You are already logged in")
    }
    else {
        res.render('signup')
    }
})

router.post("/signup", (req, res) => {
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
                            res.redirect('/user/profile')
                        })
                        .catch(e=>{
                            console.log("ERRORsignup ", e)
                        })
                                               
                    })
                })
                
            }

        })
        .catch(error => {
            console.log("You fucked up!!: " + error)
        })
})


/*login route*/
router.get("/login", (req, res) => {
    res.render('login', {
        user:req.session.user
    })
})

router.post("/login", (req, res) => {
    var username = req.body.username
    const loginQuery = {
        text: `SELECT * FROM users WHERE username = '${username}';`

       /*,SELECT * FROM activities WHERE user_id = users.user_id
        SELECT * FROM activities WHERE users.id FROM users = '${req.session.user.username}')*/
    } 
    
    client.query(loginQuery, function (err, response) {
        if (err) throw err
        if(response.rows.length === 0) {
            res.redirect('/user/signup')
        } else {
            bcrypt.compare(req.body.password /*the typed password*/, response.rows[0].password /*password in DB*/, function(err, result) {
                if(err) throw err
                if (result == true) {
                    req.session.user = {
                        username:  response.rows[0].username,
                        id: response.rows[0].id
                        } 
                        console.log(req.session.user.username)
                    res.render('activityList', {
                        user:req.session.user
                    })
                } else {
                    res.send("Wrong password")
                }
                
                
                });
        }  
    })
})

router.get("/profile", (req, res) => {
    console.log("This is: ", req.session.user)
    console.log("User_id: ", req.session.user.id)
    const profileQuery = {
        text: `Select * from activities WHERE user_id = ${req.session.user.id}`
    } 
    
    if(req.session.user) {
        client.query(profileQuery, function (err, response) {
            if(err) throw err;
            var activity = response.rows
            console.log(activity)
            res.render('profile', {
                user:req.session.user,
                activity: activity
            })
        })
    } 
    else {
        res.redirect('/user/signup')
    }
    
})

/*logout route*/
router.post("/logout", function (req, res) {
  req.session.destroy();
  console.log("Logged Out")
  res.redirect('/');
});

module.exports = router;