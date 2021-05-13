var express = require('express');
var _router = express.Router();
const checkAuth = require('../middleware/check-auth');
const inGroups = require('../middleware/in-challenge-groups')
var _ = require('lodash')

var Airtable = require("airtable");
const multer = require('multer');
const airtableKey = require('../models/airtableAPI')
var base = new Airtable({ apiKey: airtableKey.key}).base(airtableKey.base
);

const groups = base("Groups");



_router.get("/categories", checkAuth, inGroups, async (req, res, next) => {
  
  try{
  

//   console.log(groupCategories)


  myChGroups = res.locals.inGroups;
  
  // categoryArray = Object.entries(myCategories);

  // console.log(categoryArray)


  res.status(200).json({
    // categories: groupCategories,
    inGroups: myChGroups.inGroups
  })
  }
  catch{
    res.status(422).json(
    {message: 'request error'}
    );
  }

});


_router.post("/create", checkAuth, async (req, res, next)=>{
  // console.log(req.body)
  newChallenge = await challenges.create([
  {
    "fields": {
        "GroupName": req.body.GroupName,
        "GroupCategory": req.body.GroupCategory,
        "GroupImage": req.body.GroupImage,
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

  newGroup = await groups.update(
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
  newGroup = await groups.destroy(
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