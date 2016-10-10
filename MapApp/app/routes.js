var mongoose = require('mongoose');
var User = require('./model.js');

//Opens app routes
module.exports = function(app) {
	//GET route
	//Retrieve records for all the users in the db
	app.get('/users', function(req, res){
		var query = User.find({}); //Uses Mongo schema to run the search with no conditions({})
		query.exec(function(err, users) {
			if(err) {
				res.send(err);
			}

			//if no err, send all users in the form of a json
			res.json(users);
		});
	});


	// Post route
	// Provides method for saving new users into the db
	app.post('/users', function(req, res){

		//Creates a new User based on the Mongoose schema and the post body 
		var newuser = new User(req.body);

		//New user is saved in the db
		newuser.save(function(err){
			if(err) {
				res.send(err);
			}
			//if no errors are found, it responds with the JSON of the new user
			res.json(req.body);
		});

	});
};