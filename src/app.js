const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const fs = require('fs')
const pg = require('pg');
const SQL = require('sql-template-strings');
const Client = pg.Client

//json city file

var jsonfile  = require('jsonfile');
var readline  = require('readline');

var file = './cities.json';
var cities = [], i = 0, city;

//view engine config
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

//setting up static files, bodyparser and the session
app.use(express.static(__dirname + '/../public'));
app.use('/', bodyParser.urlencoded({ extended: true }));


//routes
app.get("/header", (request, response) => {
    response.render("header", {});
    });

app.get("/", (request, response) => {
    response.render("index", {});
    });

app.get("/footer", (request, response) => {
    response.render("footer", {});
    });

//searchbar

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



//cities

// readline.createInterface({
//   input: fs.createReadStream('./cities.json'),
//   output: process.stdout,
//   terminal: false
// }).on('line', function(line) {
//   city = line.split("\t");
//   if (i !== 0) {
//     // geonameid         : integer id of record in geonames database
//     // name              : name of geographical point (utf8) varchar(200)
//     // asciiname         : name of geographical point in plain ascii characters, varchar(200)
//     // alternatenames    : alternatenames, comma separated, ascii names automatically transliterated, convenience attribute from alternatename table, varchar(10000)
//     // latitude          : latitude in decimal degrees (wgs84)
//     // longitude         : longitude in decimal degrees (wgs84)
//     // feature class     : see http://www.geonames.org/export/codes.html, char(1)
//     // feature code      : see http://www.geonames.org/export/codes.html, varchar(10)
//     // country code      : ISO-3166 2-letter country code, 2 characters
//     // cc2               : alternate country codes, comma separated, ISO-3166 2-letter country code, 200 characters
//     // admin1 code       : fipscode (subject to change to iso code), see exceptions below, see file admin1Codes.txt for display names of this code; varchar(20)
//     // admin2 code       : code for the second administrative division, a county in the US, see file admin2Codes.txt; varchar(80)
//     // admin3 code       : code for third level administrative division, varchar(20)
//     // admin4 code       : code for fourth level administrative division, varchar(20)
//     // population        : bigint (8 byte int)
//     // elevation         : in meters, integer
//     // dem               : digital elevation model, srtm3 or gtopo30, average elevation of 3''x3'' (ca 90mx90m) or 30''x30'' (ca 900mx900m) area in meters, integer. srtm processed by cgiar/ciat.
//     // timezone          : the iana timezone id (see file timeZone.txt) varchar(40)
//     // modification date : date of last modification in yyyy-MM-dd format
//     cities.push({
//       country: city[8],
//       name: city[1].replace('"', '').replace('"', ''),
//       lat: city[4],
//       lng: city[5]
//     });
//   }
//   i++;
// }).on('close', function() {
//   jsonfile.writeFile(file, cities, {spaces: 2}, function (err) {
//     if (err) {
//       console.error(err)
//     }
//   })
// });



//listener
app.listen(3000, ()=>{
    console.log("Miracle happens on port 3000 =] ")
})



