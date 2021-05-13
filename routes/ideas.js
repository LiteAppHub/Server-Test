//ideas.js
var express = require('express');
var _router = express.Router();
const checkAuth = require('../middleware/check-auth');
var _ = require('lodash');
const http = require('http');
const url = require('url');
const airtableKey = require('APIKEY')


var Airtable = require("airtable");
var base = new Airtable({ apiKey: airtableKey.key}).base(airtableKey.base
);

const ideas = base("Ideas");

_router.get("/list", checkAuth, async (req, res, next) => {
  const filter = "({IdeaAuthor} = '" + req.userData.email + "')"
  console.log('ideas requested by', req.userData.email)
  try{
  
    myIdeas = await ideas.select(
    {
    'filterByFormula': filter
  }
  ).all()

  res.status(200).json(myIdeas);}
  
  catch{
    res.status(422).json(
    {message: 'request error'}
    );
  }

});



_router.get("/clist", checkAuth, async (req, res, next) => {
  let challenges = []
  // console.log(url.parse(req.url,true).query.challenges)
  let query = url.parse(req.url,true).query.challenges
  // console.log('query parameter received', query)
  
  let queryArr = Array.from(JSON.parse(query))
  let filter = []
  let ideasArr = []
  

  try{
    
    queryArr.forEach((challenge)=>{
    let challengeTitle = challenge
    filter.push(`{RelatedChallenges} = '${challengeTitle}'`)
    // console.log('filter ready ',filter)
    
  })
    filterArr = "AND(OR("+filter+"), {ActualVersion} = 'yes', {DeletedIdea}!='*')"
    // console.log('filter array ready' , filterArr)

    ideasArr.push(await ideas.select(
      {
        'filterByFormula': filterArr
      }
      ).all())
    
    myIdeas = ideasArr[0]

    myIdeas.forEach((idea)=>{
      console.log('filtered Ideas',idea.fields.IdeaTitle, idea.fields.DeletedIdea, idea.fields.ActualVersion)
    })
      
  
  myCategories = (_.groupBy(myIdeas, function(category){
    return category['fields'].IdeaStage
  }))
  
  myCategArr = Object.keys(myCategories)
  
  console.log(myCategArr)
  
  res.status(200).json({
    'Ideas': myIdeas, 
    'Categories': myCategArr
  })
  
  } catch{
    res.status(422).json(
    {message: 'request error'}
    );
  }

});


_router.post("/create", checkAuth, async (req, res, next)=>{
  console.log(req.body)
  newIdea = await ideas.create([
  {
    "fields": {
      "IdeaTitle": req.body.IdeaTitle,
      "IdeaImage": req.body.IdeaImage,
      "IdeaBrief": req.body.IdeaBrief,
      "IdeaAuthor": req.userData.email,
      "IdeaTeam": req.body.IdeaTeam,
      "IdeaStage": req.body.IdeaStage,
      "IdeaGroup": req.body.IdeaGroup,
      "RelatedChallenges": req.body.RelatedChallenges,
      "IdeaClient": req.body.IdeaClient,
      "IdeaUseCase": req.body.IdeaUseCase,
      "IdeaComponents": req.body.IdeaComponents,
      "IdeaModel": req.body.IdeaModel,
      "IdeaVersion": req.body.IdeaVersion,
      "ActualVersion": req.body.ActualVersion,
      "Acceptance": req.body.Acceptance,
    }
  }], function(err, records) {
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

_router.patch("/patch", checkAuth, async (req, res, next)=>{
  console.log(req.body)

  newIdea = await ideas.update(
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