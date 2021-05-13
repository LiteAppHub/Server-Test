//ideas.js
var express = require('express');
var _router = express.Router();
const checkAuth = require('../middleware/check-auth');
var _ = require('lodash');
const http = require('http');
const url = require('url');


var Airtable = require("airtable");
var base = new Airtable({ apiKey: "key0VrKMllc8RRhsB" }).base(
  "app1sQyN5jHMVqrrI"
);

const polls = base("Measurements");

_router.post("/create", async (req, res, next)=>{
  console.log(req.body)
  newPoll = await polls.create([
  {
    "fields": {
      "MeasurementValue": req.body.MeasurementValue,
      "MeasurementComments": req.body.MeasurementComments,
      "MeasurementUnit": req.body.MeasurementUnit,
      "MeasurementType": req.body.MeasurementType,
      "WhoMeasured": req.body.WhoMeasured,
      
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

module.exports = _router;