/**
 * File describing schema (ODM type; object-document mapping) in MongoDB
 */
var mongoose = require('mongoose');

exports.schema = new mongoose.Schema({
	id : {type: String, index: {unique: true}},
	primarycontactnumber: {type: String},
	firstname: String,
	lastname: String,
	title: String,
	company: String,
	jobtitle: String,
	othercontactnumbers: [String],
	primaryemailaddress: String,
	emailladdresses: [String],
	groups: [String]
});
