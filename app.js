const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const quotes = require('./routes/quotes');
const userRoutes = require('./routes/user')
const fileRoutes = require('./routes/file');
const ideaRoutes = require('./routes/ideas');
const challengeRoutes = require('./routes/challenges');
const groupRoutes = require('./routes/groups');
const pollsRoutes = require('./routes/polls');
const app = express();

mongoose.connect('mongodb+srv://BungeeStart:'+ process.env.MONGO_ATLAS_PW + '@cluster0.w0rtu.mongodb.net/bs-ideas?retryWrites=true&w=majority').then(()=>{
  console.log('Connected to Database!')
}).catch(()=>{
  console.log('Connection to database failed', process.env.MONGO_ATLAS_PW)

})



let myQuotes;

app.use(bodyParser.json())

app.use(express.static('public'))
app.use('/public',express.static(__dirname + '/public'))

app.use((req, res, next) => {
  console.log("Adding headers now");
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-Width,Content-Type,Accept,Authorization,Custom-Header"
  );
  res.header("Access-Control-Allow-Methods", "OPTIONS, GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Credentials", true);
  console.log("Headers added")
  if ("OPTIONS" == req.method) {
    console.log("sending headers status 200 OKIS")
    res.sendStatus(200);
  } else {
    console.log("ohh ohh");
    // console.log("ohh ohh",`${req.ip}${req.method}${req.url}`);
    next();
  }
});

app.get("/",(req,res)=>{
  res.send("Running");
})

app.get("/api/quotes", async (req, res) => {
  myQuotes = await quotes.select().all();

  res.status(200).json(myQuotes);
});


app.use ('/api/user', userRoutes);
app.use ('/api/files', fileRoutes);
app.use ('/api/ideas', ideaRoutes);
app.use ('/api/challenges', challengeRoutes);
app.use ('/api/groups', groupRoutes);
app.use ('/api/polls', pollsRoutes);

module.exports = app;
