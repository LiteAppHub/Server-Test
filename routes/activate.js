const express = require('express');
const router = express.Router();
var Airtable = require("airtable");
const airtableKey = require('../models/airtableAPI')
var base = new Airtable({ apiKey: airtableKey.key}).base(airtableKey.base
);

const users = base("Teams");





module.exports = router;