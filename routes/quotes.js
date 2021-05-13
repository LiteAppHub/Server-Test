var Airtable = require("airtable");
var base = new Airtable({ apiKey: "key0VrKMllc8RRhsB" }).base(
  "app1sQyN5jHMVqrrI"
);

const table = base("Quotes");

const getQuotes = async () => {
  const quotes = await table
    .select({ fields: ["QuoteTitle", "QuoteText", "QuoteCategory"] })
    .all();
};
module.exports = table;

getQuotes();
