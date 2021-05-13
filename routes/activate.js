const express = require('express');
const router = express.Router();
var Airtable = require("airtable");
var base = new Airtable({ apiKey: "key0VrKMllc8RRhsB" }).base(
  "app1sQyN5jHMVqrrI"
);

const users = base("Teams");





module.exports = router;