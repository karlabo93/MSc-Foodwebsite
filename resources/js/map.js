            // setup global variables
			var map, start, end, startName, endName, nearest, nearestLat, nearestLong, currentLoc, geojson;
			
            //Storing coordinates for each store location
            var locLon = [-2.24115987545806, -2.28797113618623, -2.34611903044906, -0.0186272, 0.0377721, -0.106110533818894, -2.88602760755296, -2.92498576982047, -3.0221668, -1.89498225691427, -1.77882846764955, -1.96810197070966];
            var locLat = [53.48353555,53.48866415,53.46255895, 51.5035036, 51.5354294, 51.5341845, 53.48179235, 53.4092579, 53.3889415, 52.4769411, 52.4125947, 52.4169409];
            
            //Address of store to be used for geocoding
            var locationSelection = ["Arndale Manchester", "Salford Shopping Centre", "Trafford Centre", "Canary Wharf", "King's Road London", "Angel Central London", "Kirkby Shopping Centre", "Liverpool Shopping Park", "Pyramids B Shopping", "Bullring Birmingham", "Touchwood Shopping", "Northfield Shopping Centre Birmingham" ]
            
 
            //First initMap for when the page first loads
			function initMap(){
                
                //creates a map with the view set to UK
				map = L.map('map').setView([52.715, -1.818], 7);

                //this adds the basemap tiles to the map
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Geocoding by <a href="https://nominatim.org">Nominatim</a>.Routing by <a href="https://openrouteservice.org/">OpenRouteService</a>'
				}).addTo(map);
                
                //Add a marker for each location
                for(let i = 0; i < locLat.length; i++){

                   L.marker([locLat[i], locLon[i]], {icon: redIcon}).addTo(map);
                }
			}
            
            // Second initMap for the location buttons
            function initMap2(locationSelection){
                
                //remove any previous maps
                map.remove();
                
                //Store the input of the address box into a variable
                var input = document.getElementById("userInput").value;
                console.log(input);
                
				map = L.map('map').setView([52.715, -1.818], 7);

				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Geocoding by <a href="https://nominatim.org">Nominatim</a>.Routing by <a href="https://openrouteservice.org/">OpenRouteService</a>'
				}).addTo(map);
                
                for(let i = 0; i < locLat.length; i++){
                    
                   L.marker([locLat[i], locLon[i]], {icon: redIcon}).addTo(map);

                }
				
				// set placenames for start and end point
				startName = input;	
                endName = locationSelection;
                
				// geocode the place names and calculate route
				startGeocoding();
			}
            
            //This initMap is for the 'closest location' button, which will be directed to doRouting() instead of startGeocoding().
             function initMap3(){
                
                map.remove();
                
                var input = document.getElementById("userInput").value;
                console.log(input);
                
				map = L.map('map').setView([52.715, -1.818], 7);

				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Geocoding by <a href="https://nominatim.org">Nominatim</a>.Routing by <a href="https://openrouteservice.org/">OpenRouteService</a>'
				}).addTo(map);
                
                for(let i = 0; i < locLat.length; i++){

                   L.marker([locLat[i], locLon[i]], {icon: redIcon}).addTo(map);

                }
				
				startName = input;	
                 
				// Directly proceed to obtain route
				doRouting(nearestLong, nearestLat);
			}
			
            //Begin geocoding process
			function startGeocoding(){
			
				// geocode start location
				makeRequest(getGeocodeURL(startName), continueGeocoding);
			}
			
			//Obtain coordinates of starting point, set map to view that location and add a marker.
			function continueGeocoding(data){
			
				// record the start location
				start = [data[0].lon, data[0].lat];
                startLat = parseFloat(start[1]);
                startLong = parseFloat(start[0]);
                console.log(startLat, startLong);
                
                currentLoc = new L.marker([startLat, startLong], {icon: humanIcon}).addTo(map);
                
                map.addLayer(currentLoc);
                
                map.setView([startLat, startLong], 12);
                
                //Using turf.js to obtain nearest store location and storing the coordinates into a variable
                var targetPoint = turf.point([startLong, startLat]);
                var points = turf.featureCollection([
                turf.point([locLon[0], locLat[0]]),
                turf.point([locLon[1], locLat[1]]),
                turf.point([locLon[2], locLat[2]]),
                turf.point([locLon[3], locLat[3]]),
                turf.point([locLon[4], locLat[4]]),
                turf.point([locLon[5], locLat[5]]),
                turf.point([locLon[6], locLat[6]]),
                turf.point([locLon[7], locLat[7]]),
                turf.point([locLon[8], locLat[8]]),
                turf.point([locLon[9], locLat[9]]),
                turf.point([locLon[10], locLat[10]]),
                turf.point([locLon[11], locLat[11]])
                ]);
                
                nearest = turf.nearestPoint(targetPoint, points);
                
                nearestLat = nearest.geometry.coordinates[1];
                nearestLong = nearest.geometry.coordinates[0];
                  
				// geocode end location
				makeRequest(getGeocodeURL(endName), finishGeocoding);
			}
			
			function finishGeocoding(data){
				
				// record the end location coordinates
				end = [data[0].lon, data[0].lat];
				
				//calculate the route between the two locations
				doRouting(end[0], end[1]);
			}
			
			
            //Generate and return a Nominatim geocoding URL for a given placename
			function getGeocodeURL(placename) {
				return ["https://nominatim.openstreetmap.org/?format=json&limit=1&q=", placename].join("");
			}
			
			
            //Calculate the route between the start and end location
			function doRouting(endLoc1, endLoc2) {
				
				//construct a url out of the required options for OpenRouteService
				var url = [
	
					// these bits are fixed or imported from the start and variables above 
					'https://api.openrouteservice.org/directions?',
					'api_key=','5b3ce3597851110001cf6248ea792f668c01446ca53febdaec02d8bf',	// TODO: SET YOUR API KEY HERE
					'&coordinates=',start[0].toString(),',',start[1].toString(),'%7C', endLoc1.toString(),',',endLoc2.toString(),
		
					// these are the options, a comprehensive list is available at: https://openrouteservice.org/dev/#/api-docs/directions/get
					'&profile=', 			'driving-car',	
					'&preference=', 		'fastest',
					'&format=', 			'geojson',
					'&units=', 				'km',
					'&geometry_format=', 	'geojson'
		
				].join("");	//join the array with no delimiter

				// log the url that was constructed
				//console.log(url);
	
				// send the request to OpenRouteService, set callback
				makeRequest(url, routeToMap);
			}
			
			
            //Make a request for JSON over HTTP, pass resulting text to callback when ready
			function makeRequest(url, callback) {

				//initialise the XMLHttpRequest object
				var httpRequest = new XMLHttpRequest();

				//set an event listener for when the HTTP state changes
				httpRequest.onreadystatechange = function () {

					//if it works, parse the JSON and pass to the callback	
					//a successful HTTP request returns a state of DONE and a status of 200
					if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
						callback(JSON.parse(httpRequest.responseText));
					}
				};

				//prepare and send the request
				httpRequest.open('GET', url);
				httpRequest.send();
			}   
			
			//Retrieve a GeoJSON route and add it to the map
			 function routeToMap(route) {
                 
                 //function to remove any existing route layers
			     if (map.hasLayer(geojson)){
                     map.removeLayer(geojson);
                 }
                 
                 else{}
                 
			 	// load into L.GeoJson, style and add to the map
				geojson = L.geoJson(route, {
					style: {
						weight: 4,
						opacity: 1,
					}
				}).addTo(map);
				
				// zoom the map to fit
				map.fitBounds(geojson.getBounds());
				
				// add markers to the start and end (remember to flip longitude and latitude!)
                map.removeLayer(currentLoc);
				markerStart = L.marker([start[1], start[0]], {icon: carIcon}).addTo(map);
			 
			 	// get info about the route from the dataset		 
			 	var duration = route.features[0].properties.summary[0].duration;
			 	var distance = route.features[0].properties.summary[0].distance;

				// get the description of the route
			 	var segments = route.features[0].properties.segments;
			 	
			 	// build HTML directions as a table
			 	var directionsHTML = [
			 		"<table><th>Directions (", 
			 		getDistanceString(distance), 
			 		", <i>",
			 		getDurationString(duration),
			 		"</i>)</th>"
			 	].join("");
			 	
			 	// loop through the description for each segment of the journey
				for (var i = 0; i < segments.length; i++){
					
					// loop through each step of the current segment
					for (var j = 0; j < segments[i].steps.length; j++){
						
						// add a direction to the table
						directionsHTML += [ 
							"<tr><td><b>", 
							segments[i].steps[j].instruction,
							"</b> (",
							getDistanceString(segments[i].steps[j].distance),
							", <i>",
							getDurationString(segments[i].steps[j].duration),
							"</i>)</td></tr>"
						].join("");
					}
				}
				
				// close the table
				directionsHTML += "</table>";
				
				// load the directions into the div
				document.getElementById('directions').innerHTML = directionsHTML;
			 }

            //Returns a sensible distance string for a given distance in km
			function getDistanceString(distance){
				
				//is it more than 1km?
				if (distance > 1) {
					
					//if so, use km
					return distance.toFixed(1) + "km";
				
				} else {
					
					// if not, use m
					return Math.ceil(distance * 1000).toFixed(0) + "m";
				}
			}
				
            //Returns a sensible duration string for a given duration in seconds
			function getDurationString(duration){
				
				// hours
				if (duration > 3600) {
					
					//return hours and minutes
					return Math.floor(duration / 3600).toFixed(0) + " hrs " + 
						Math.ceil((duration % 3600) / 60).toFixed(0) + " mins";
				
				// minutes
				} else if (duration > 60) {
					
					// minutes only
					return Math.ceil(duration / 60).toFixed(0) + " mins";
				
				// seconds
				} else {
					
					// seconds only
					return Math.ceil(duration).toFixed(0) + " secs";
				}
			}
            
            //Print the input address below the input box
            function printAddress() {
                document.getElementById("addressStatement").innerHTML = document.getElementById('userInput').value
          }
            //Trigger an alert if the address has not been typed in
            function validateForm() {
              var x = document.forms["myForm"]["fName"].value;
              if (x == "") {
                alert("Address must be filled out");
                return false;
              }
            }
            
            //Styles for icons used
            var redIcon = L.icon({
                iconUrl: 'resources/iconimg/burger.png',
                iconSize:[32, 37], // size of the icon
                iconAnchor:[16, 37], // point of the icon which will correspond to marker's location
            });
            
            var carIcon = L.icon({
                iconUrl: 'resources/iconimg/car2.png',
                iconSize:[32, 37], // size of the icon
                iconAnchor:[16, 15], // point of the icon which will correspond to marker's location
            });
            
            var humanIcon = L.icon({
                iconUrl: 'resources/iconimg/human.png',
                iconSize:[32, 37], // size of the icon
                iconAnchor:[16, 37], // point of the icon which will correspond to marker's location
            });