var express = require('express');
var _router = express.Router();
const checkAuth = require('../middleware/check-auth');
const upload = require('./file')
const fs = require('fs')
const path = require('path')
const inGroups = require('../middleware/in-challenge-groups')
var Airtable = require("airtable");
const airtableKey = require('../models/airtableAPI')
var base = new Airtable({ apiKey: airtableKey.key}).base(airtableKey.base
);

const challenges = base("Challenges");
const teams = base("Teams");

let filterChallenges = []

_router.get("/can-edit", checkAuth, async (req, res, next) => {
  // console.log(req.userData.email)
  try{
    let filter = 'OR(SEARCH("'+req.userData.email+'", {ChallengeTeam},0) > 0, {ChallengeCreator} = "'+req.userData.email+'")'

  myChallenges = await challenges.select({
    filterByFormula: filter
  }).all()

  

  res.status(200).json(myChallenges)
  }
  catch{
    res.status(422).json(
    {message: 'request error'}
    );
  }

});


_router.get("/filters", checkAuth, inGroups, async (req, res, next) => {

  try{

  myFilters = res.locals.inGroups
  // console.log('myFilters',myFilters)

  res.status(200).json(myFilters)
  }
  catch{
    res.status(422).json(
    {message: 'request error'}
    );
  }

});
_router.get("/teams", checkAuth, async (req, res, next) => {
  // console.log('Hub request from ', req.userData.email)
  try{

  myTeams = await teams.select().all()

  myTeams.forEach((user)=>{
    console.log('Teams users ', user.fields.UserId, user.fields.UserDomain, user.fields.UserStatus)
  })
  

  res.status(200).json(myTeams)
  }
  catch{
    res.status(422).json(
    {message: 'request error'}
    );
  }

});


_router.get("/home-view", async (req, res, next) => {
  // console.log('Hub request from ', req.userData.email)
  try{
    let filter = 'AND({ChallengeScope} = "Public" ,{ActualVersion} = "yes", {DeletedChallenge} != "*", {HomepageChallenge} = "Main challenges")'

  mainChallenges = await challenges.select({
    filterByFormula: filter
  }).all()

  mainChallenges.forEach((challenge)=>{
    console.log('Home challenges ', challenge.fields.ChallengeTitle, challenge.fields.ActualVersion, challenge.fields.DeletedChallenge)
  })
  

  res.status(200).json(mainChallenges)
  }
  catch{
    res.status(422).json(
    {message: 'Home Data request error'}
    );
  }

});


_router.get("/can-view", checkAuth, async (req, res, next) => {
  // console.log('Hub request from ', req.userData.email)
  try{
    let filter = 'AND(OR(SEARCH("'+req.userData.email+'", {ChallengeAccessList},0) > 0, SEARCH("'+req.userData.email+'", {ChallengeTeam},0) > 0, {ChallengeCreator} = "'+req.userData.email+'", {ChallengeScope} = "Public" ),{ActualVersion} = "yes", {DeletedChallenge} != "*")'

  myChallenges = await challenges.select({
    filterByFormula: filter
  }).all()

  myChallenges.forEach((challenge)=>{
    // console.log('Hub challenges ', challenge.fields.ChallengeTitle, challenge.fields.ActualVersion, challenge.fields.DeletedChallenge)
  })
  

  res.status(200).json(myChallenges)
  }
  catch{
    res.status(422).json(
    {message: 'request error'}
    );
  }

});

_router.post("/challengeDocs", checkAuth, async (req, res, next) => {
  console.log('file request ', req.body.location)
  try{
  
  fs.readFile('uploads/'+req.body.location,function(error,data){
    if(error){
       res.json({'status':'error', msg:error});
    }else{
       console.log(data)
       res.writeHead(200, {"Content-Type": "application/pdf"});
       res.write(data);
       res.end();       
    }
  });




  }
  catch{

    res.status(422).json(
    {message: 'request error'}
    );

  }

});



_router.post("/create", checkAuth, async (req, res, next)=>{
  console.log('challengeDoc to post in server', req.body.ChallengeDoc)
  newChallenge = await challenges.create([
  {
    "fields": {
        "ChallengeTitle": req.body.ChallengeTitle,
        "ChallengeBrief": req.body.ChallengeBrief,
        "ChallengeDoc": req.body.ChallengeDoc,
        "ChallengeBusiness": req.body.ChallengeBusiness,
        "ChallengeGroup": req.body.ChallengeGroup,
        "ChallengeScope": req.body.ChallengeScope,
        "ChallengeStage": req.body.ChallengeStage,
        "ChallengeParent": req.body.ChallengeParent,
        "ChallengeDeadline": req.body.ChallengeDeadline,
        "ChallengeImpact": req.body.ChallengeImpact,
        "ChallengeCalculation": req.body.ChallengeCalculation,
        "ChallengeStakeholder": req.body.ChallengeStakeholder,
        "ChallengeClient": req.body.ChallengeClient,
        "ChallengeClientProfile": req.body.ChallengeClientProfile,
        "ChallengeTeam": req.body.ChallengeTeam,
        "RelatedChallenges": req.body.RelatedChallenges,
        "ChallengeSuccess": req.body.ChallengeSuccess,
        "ChallengeBudget": req.body.ChallengeBudget,
        "ChallengePrize": req.body.ChallengePrize,
        "ChallengeVersion": req.body.ChallengeVersion,
        "ActualVersion": req.body.ActualVersion,
        "ChallengeAccessList": req.body.ChallengeAccessList,
        "ChallengeCreator": req.userData.email,
        "ChallengeType": req.body.ChallengeType,
    }
  }], function(err, records) {
  if (err) {
    console.error('Error creating challenge', err);
    return;
  }
  records.forEach(function (record) {
    console.log(record.getId());
    res.status(200).json(records);
  });
})
})

_router.patch("/patch", checkAuth, async (req, res, next)=>{
  // console.log(req.body)

  newChallenge = await challenges.update(
    req.body, function(err, records) {
  if (err) {
    console.error(err);
    return;
  }
  records.forEach(function (record) {
    console.log('Registro modificado', record.getId());
    res.status(200).json(records);
  });
})

})


_router.patch("/delete", checkAuth, async (req, res, next)=>{
  console.log(req.body)
  newIdea = await ideas.destroy(
    req.body, function(err, records) {
  if (err) {
    console.error(err);
    return;
  }
  records.forEach(function (record) {
    console.log(record.getId());
    res.status(200).json(records);
  });
})

})

module.exports = _router;