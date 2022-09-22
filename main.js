require('dotenv').config();
const express = require("express");
const app = express();
const https = require("https");
const fs = require("fs");
const bodyParser = require("body-parser");
const EventBus = require("./event-bus.js");
app.use(bodyParser.text({type: '*/*'}));


//https://smsbind.martian17.com:3265/webhook
const server = https.createServer({
    key: fs.readFileSync('./ssl/privkey.pem'),
    cert: fs.readFileSync('./ssl/fullchain.pem'),
},app).listen(process.env.PORT, function(){
    console.log(`listening to ${process.env.PORT}`);
});


const hub = new EventBus();

const bindings = fs.readdirSync("./bindings").map(fn=>"./bindings/"+fn).map(fn=>{
    console.log(fn);
    require(fn)(app,hub);
});