angular.module('gservice', [])
    .factory('gservice', function($http, $rootScope){
    	var googleMapService = {},
    		locations = [],
    		selectedLat = 39.50,
    		selectedLong = -98.35;

    	googleMapService.clickLat = 0;
    	googleMapService.clickLong = 0;

    	//Refresh the map with the new data, fn will take latitude and longitude
    	googleMapService.refresh = function(latitude, longitude) {
    		locations = [];
    		selectedLat = latitude;
    		selectedLong = longitude;
    		$http.get('/users').then(function(resp){
    			locations = convertToMapPoints(resp.data);
    			initialize(latitude, longitude);
    		}, function(err){
    			window.console.error('Cannot get users', err);
    		});
    	};

    	// Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
	                var user = response[i];

	                // Create popup windows for each record
	                var  contentString =
	                    '<p><b>Username</b>: ' + user.username +
	                    '<br><b>Age</b>: ' + user.age +
	                    '<br><b>Gender</b>: ' + user.gender +
	                    '<br><b>Favorite Language</b>: ' + user.favlang +
	                    '</p>';

	                // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
	                locations.push({
	                    latlon: new google.maps.LatLng(user.location[1], user.location[0]),
	                    message: new google.maps.InfoWindow({
	                        content: contentString,
	                        maxWidth: 320
	                    }),
	                    username: user.username,
	                    gender: user.gender,
	                    age: user.age,
	                    favlang: user.favlang
	            });
	        }
	        // location is now an array populated with records in Google Maps format
	        return locations;
    	};
    	// Initializes the map
		var initialize = function(latitude, longitude) {

		    // Uses the selected lat, long as starting point
		    var myLatLng = {lat: selectedLat, lng: selectedLong};

		    // If map has not been created already...
		    if (!map){

		        // Create a new map and place in the index.html page
		        var map = new google.maps.Map(document.getElementById('map'), {
		            zoom: 3,
		            center: myLatLng
		        });
		    }

		    // Loop through each location in the array and place a marker
		    locations.forEach(function(n, i){
		        var marker = new google.maps.Marker({
		            position: n.latlon,
		            map: map,
		            title: "Big Map",
		            icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
		        });

		        // For each marker created, add a listener that checks for clicks
		        google.maps.event.addListener(marker, 'click', function(e){

		            // When clicked, open the selected marker's message
		            currentSelectedMarker = n;
		            n.message.open(map, marker);
		        });
		    });

		    // Set initial location as a bouncing red marker
		    var initialLocation = new google.maps.LatLng(latitude, longitude);
		    var marker = new google.maps.Marker({
		        position: initialLocation,
		        animation: google.maps.Animation.BOUNCE,
		        map: map,
		        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
		    });
		    lastMarker = marker;
		    // // Function for moving to a selected location
			map.panTo(new google.maps.LatLng(latitude, longitude));
			google.maps.event.addListener(map, 'click', function(e){
				var marker = new google.maps.Marker({
					position: e.latLng,
					animation: google.maps.Animation.BOUNCE,
					map: map,
					icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
				});
				if(lastMarker) {
					lastMarker.setMap(null);
				}
				lastMarker = marker;
				map.panTo(marker.position);
				googleMapService.clickLat = marker.getPosition().lat();
				googleMapService.clickLong = marker.getPosition().lng();
				$rootScope.$emit("clicked");
			});
		};


		// Refresh the page upon window load. Use the initial latitude and longitude
		google.maps.event.addDomListener(window, 'load',
		    googleMapService.refresh(selectedLat, selectedLong));


		return googleMapService;

    });