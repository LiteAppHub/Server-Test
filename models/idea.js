const mongoose = require('mongoose');

const ideaSchema = mongoose.Schema({
    IdeaTitle: {type: String, required: true},
    IdeaBrief: {type:String}
})


module.exports = mongoose.model('Idea', ideaSchema);