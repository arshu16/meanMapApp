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

	// Retrieves JSON records for all users who meet a certain set of query conditions
	app.post('/query/', function(req,res){
		var lat = req.body.latitude,
			long = req.body.longitude,
			distance = req.body.distance,
			male = req.body.male,
    		female = req.body.female,
    		other = req.body.other,
    		minAge = req.body.minAge,
    		maxAge = req.body.maxAge,
    		favLang = req.body.favlang,
    		reqVerified = req.body.reqVerified;

		// Opens a generic Mongoose Query. Depending on the post body we will...
		var query = User.find({});

		// ...include filter by Max Distance (converting miles to meters)
		if(distance) {
			// Using MongoDB's geospatial querying features.
			query = query.where('location').near({
				center: {
					type: 'Point',
					coordinates: [long, lat]
				},
				maxDistance: distance * 1609.34, // Converting meters to miles. 
				spherical: true//Specifying spherical geometry (for globe)
			});
		}

		// ...include filter by Gender (all options)
	    if(male || female || other){
	        query.or([{ 'gender': male }, { 'gender': female }, {'gender': other}]);
	    }

	    // ...include filter by Min Age
	    if(minAge){
	    	query = query.where('age').gte(minAge);
	    }

	    // ...include filter by Max Age
	    if(maxAge){
	        query = query.where('age').lte(maxAge);
	    }

	    // ...include filter by Favorite Language
	    if(favLang){
	        query = query.where('favlang').equals(favLang);
	    }

	     // ...include filter for HTML5 Verified Locations
	    if(reqVerified){
	        query = query.where('htmlverified').equals("Yep (Thanks for giving us real data!)");
	    }



		query.exec(function(err, users){
			if(err) {
				res.send(err);
			} else {
				res.json(users);
			}
		});
	});
};