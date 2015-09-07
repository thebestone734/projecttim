/**
 * File supporting all CRUD operations
 */

/**
 * Removing given attribute from model
 * @param model Model variable instatntiated from Schema
 * @param attribute Given attribute to remove
 * @param respone Response as to where to call back
 */
exports.remove = function(model, _attribute, response) {
	console.log('Deleting model instance with attribute: ' + attribute);
	
	model.findOne({id: _attribute}, function(error, data) {
		if (error) {
			console.log(error);
			if (response != null) {
				response.writeHead(500, {'Content-Type' : 'text/plain'});
				response.end('Internal server error');
			}
			return;
		} else {
			if (!data) {
				console.log('not found');
				if (response != null) {
					response.writeHead(404, {'Content-Type' : 'text/plain'});
					response.end('Not Found');
				}
				return;
			} else {
				data.remove(function(error) {
					if (!error) {
						data.remove();
					}
					else {
						console.log(error);
					}
				});
				if (response != null) {
					response.send('Deleted');
				}
				return;
			}
		}
	});
}

/**
 * Updating given model
 * @param model Model variable instantiated from Schema
 * @param requestBody Request with parameters
 * @param respone Response as to where to call back
 */
exports.update = function(model, requestBody, response) {
	var userid = requestBody.id;
	
	model.findOne({id: userid}, function(error, data) {
		if (error) {
			console.log(error);
			if (response != null) {
				response.writeHead(500, {'Content-Type' : 'text/plain'});
				response.end('Internal server error');
			}
			return;
		} else {
			var instance = toModel(requestBody, model);
			if (!data) {
				console.log('Model with id: '+ id + ' does not exist. Model instance will be created.');
				
				instance.save(function(error) {	
					if (!error)
						instance.save();
				});
				if (response != null) {
					response.writeHead(201, {'Content-Type' : 'text/plain'});
					response.end('Created');
				}
				return;
			}
			
			//populate the document with the updated values
			// TODO: wrap this in function so that it's loosely coupled
			data.id = instance.id;
			data.firstname = instance.firstname;
			data.lastname = instance.lastname;
			data.title = instance.title;
			data.company = instance.company;
			data.jobtitle = instance.jobtitle;
			data.primarynumber = instance.primarynumber;
			data.othercontactnumbers = instance.othercontactnumbers;
			data.emailaddresses = instance.emailaddresses;
			data.primaryemailaddress = instance.primaryemailaddress;
			data.groups = instance.groups;
			//now save
			data.save(function (error) {
				if (!error) {
					console.log('Successfully updated instance with id: '+ userid);
					data.save();
				} else {
					console.log('error on save');
				}
			});
			if (response != null) {
				response.send('Updated');
			}
		}
	});
};

/**
 * Creating model instance 
 * @param model Model variable instantiated from Schema
 * @param requestBody request for needed parameters
 * @param respone Response as to where to call back
 */
exports.create = function(model, requestBody, response) {
	var instance = toModel(requestBody, model);
	var attribute = requestBody.id;
	
	instance.save(function(error) {
		if (!error) {
			instance.save();
		} else {
			console.log('Checking if instance saving failed due to already existing id:' + attribute);
			model.findOne({id: attribute}, function(error, data) {
			if (error) {
				console.log(error);
				if (response != null) {
					response.writeHead(500, {'Content-Type' : 'text/plain'});
					response.end('Internal server error');
				}
				return;
			} else {
				var instance = toModel(requestBody, model);
				if (!data) {
					console.log('The instance does not exist. It will be created');
					instance.save(function(error) {
						if (!error) {
							instance.save();
						} else {
							instance.log(error);
						}
					});
					if (response != null) {
						response.writeHead(201, {'Content-Type' : 'text/plain'});
						response.end('Created');
					}
					return;
				} else {
					console.log('Updating model with id:' + attribute);
					data.id = instance.id;
					data.firstname = instance.firstname;
					data.lastname = instance.lastname;
					data.title = instance.title;
					data.company = instance.company;
					data.jobtitle = instance.jobtitle;
					data.primarycontactnumber =	instance.primarycontactnumber;
					data.othercontactnumbers = instance.othercontactnumbers;
					data.emailaddresses = instance.emailaddresses;
					data.primaryemailaddress = instance.primaryemailaddress;
					data.groups = instance.groups;
		
					data.save(function (error) {
							if (!error) {
								data.save();
								response.end('Updated');
								console.log('Successfully Updated model instance with id: ' + attribute);
							} else {
								console.log('Error while saving model instance with id:' + attribute);
								console.log(error);
							}
						});
					}
				}
			});
		}
	});
};

function toModel(body, model) {
	return new model({
		id: body. id,
		firstname: body.firstname,
		lastname: body.lastname,
		title: body.title,
		company: body.company,
		jobtitle: body.jobtitle,
		primarycontactnumber: body.primarycontactnumber,
		primaryemailaddress: body.primaryemailaddress,
		emailaddresses: body.emailaddresses,
		groups: body.groups,
		othercontactnumbers: body.othercontactnumbers
	});
}

/**
 * Rather simple implementation of "select"
 * @param model Model variable instatntiated from Schema
 * @param attribute Given attribute to remove
 * @param respone Response as to where to call back
 */
exports.findByNumber = function(model, _id, response) {
	model.findOne({id: _id}, function(error, result) {
		if (error) {
			console.error(error);
			response.writeHead(500, {'Content-Type' : 'text/plain'});
			response.end('Internal server error');
			return;
		} else {
			if (!result) {
				if (response != null) {
					response.writeHead(404, {'Content-Type' : 'text/plain'});
					response.end('Not Found');
				}
				return;
			}
			if (response != null) {
				response.setHeader('Content-Type', 'application/json');
				response.send(result);
			}
			console.log(result);
		}
	});
}



exports.list = function (response) {
	Contact.find({}, function(error, result) {
		if (error) {
			console.error(error);
			return null;
		}
		if (response != null) {
			response.setHeader('content-type', 'application/json');
			response.end(JSON.stringify(result));
		}
		return JSON.stringify(result);
	});
}
