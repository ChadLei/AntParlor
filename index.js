var lat, lng, latlng,currentCity;
document.cookie = "professional"

// AWS ~~~~~~~~~
// Configure AWS SDK for JavaScript for LAMBDA
AWS.config.region = 'us-west-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-west-2:01df0e0c-6be5-46cd-b277-f60d4e3021a0',
});

// Prepare to call Lambda function
var lambda = new AWS.Lambda({region: 'us-west-1', apiVersion: '2015-03-31'});
var lambda1 = new AWS.Lambda({region: 'us-west-1', apiVersion: '2015-03-31'});

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else { 
        console.log("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
	lat = position.coords.latitude;
    lng = position.coords.longitude;
    latlng = {lat: parseFloat(lat), lng: parseFloat(lng)};
    console.log(latlng);
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}

function geocodeLatLng() {
	var geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === 'OK') {
        if (results[0]) {
               console.log(results[0].formatted_address);
               currentCity = results[0].address_components[2].long_name
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
}

var rad = function(x) {
  return x * Math.PI / 180;
};

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(p2.lat() - p1.lat());
  var dLong = rad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};

function switchType(professional){
    if (professional == "professional"){
        document.cookie = "professional";
        
    }
    else if(professional == "amateur"){
        document.cookie = "amateur";

    }
}

function testPriceFunc(price,t){
    var professional = document.cookie;
    console.log(professional);
    if (currentCity == null){
        currentCity = "Irvine"
    }
    if (professional == 'professional' || professional == null){
        console.log('a');
        var pullParams = {
            FunctionName : 'priceRec',
            InvocationType : 'RequestResponse',
            LogType : 'None',
            Payload: '{"city" : "'+ currentCity +'", "action" : "query"}'
    
          };
    }
    if (professional == 'amateur'){
        console.log('b');
        var pullParams = {
            FunctionName : 'priceRecStudents',
            InvocationType : 'RequestResponse',
            LogType : 'None',
            Payload: '{"city" : "'+ currentCity +'", "action" : "query"}'
    
          };
    }

    lambda.invoke(pullParams, function(error, data) {
        if (error) {
          prompt(error);
        } else {
          pullResults = JSON.parse(data.Payload).Items;
          if(price == "$"){
            for (var key in pullResults) {
                if(pullResults[key].price == '$'){
                  console.log(pullResults[key]);
              }
          }
          }
          else if(price == "$$"){
            for (var key in pullResults) {
                if(pullResults[key].price == '$$'){
                  console.log(pullResults[key]);
              }
          }
          }
          else if(price == "$$$"){
            for (var key in pullResults) {
                if(pullResults[key].price == '$$$'){
                  console.log(pullResults[key]);
              }
          }

          }
          return pullResults;
    }
});
}

var amaRec = {
    "Barber" : '',
    "Threading" : '',
    "Makeup" : '',
    "Nails" : ''
}

var pullParams1 = {
  FunctionName : 'displayRec',
  InvocationType : 'RequestResponse',
  LogType : 'None',
  Payload: '{"city" : "Irvine"}'
};

var pullResults;

lambda1.invoke(pullParams1, function(error, data) {
  if (error) {
    prompt(error);
  } else {
    pullResults = JSON.parse(data.Payload);
    //console.log(pullResults);
    for (var obj in pullResults.Items) {
        // Still need to rank by location
        // Adding in the dynamic available check for 1
        if (pullResults.Items[obj].dynamicAvailable) {
          if (pullResults.Items[obj].serviceType == 'Barber' && amaRec.Barber == '') {
              amaRec.Barber = pullResults.Items[obj].name;
          }
          if (pullResults.Items[obj].serviceType == 'Threading' && amaRec.Threading == '') {
              amaRec.Threading = pullResults.Items[obj].name;
          }
          if (pullResults.Items[obj].serviceType == 'Nails' && amaRec.Nails == '') {
              amaRec.Nails = pullResults.Items[obj].name;
          }
          if (pullResults.Items[obj].serviceType == 'Makeup' && amaRec.Makeup == '') {
              amaRec.Makeup = pullResults.Items[obj].name;
          }
          //console.log(pullResults.Items[obj].serviceType);
        }
    }
    console.log(amaRec);
  }
});


$( document ).ready(function() {
	getLocation();
	setTimeout(function(){ 
		console.log("here");
		geocodeLatLng(); 
	}, 10000);
});

