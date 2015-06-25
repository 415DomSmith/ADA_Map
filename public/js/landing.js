$(function() {
  var map;
	var mapDiv = document.getElementById('map-canvas');
	
	function initialize() {
  
		var mapOptions = {
	    zoom: 16
	    // center: {lat: 39, lng: -94}
	  };

	  map = new google.maps.Map(mapDiv,mapOptions);


	  if(navigator.geolocation) {
	    navigator.geolocation.getCurrentPosition(function(position) {
	      var pos = new google.maps.LatLng(position.coords.latitude,
	      																 position.coords.longitude);

	      var infowindow = new google.maps.InfoWindow({
	        map: map,
	        position: pos,
	        content: 'Location found'
	      });

	      map.setCenter(pos);
	    }, function() {
	      handleNoGeolocation(true);
	    });
	  } else {
	    // Browser doesn't support Geolocation
	    handleNoGeolocation(false);
	  }

	  $.ajax({
        type: 'GET',
        url: '/issues',
        dataType: 'json'
    }).done(function (data){
    	console.log(data);
    	var issues = data.issues;
      issues.forEach(function (issue){
          
        var lat = issue.lat;
        var long = issue.long;
        var title = issue.title;
        var myLatlng = new google.maps.LatLng(lat,long);

        var marker = new google.maps.Marker({
        	position: myLatlng,
          map: map,
          animation: google.maps.Animation.DROP,
          title: issue.title
        })

      })
    })
	  
	}

	function handleNoGeolocation(errorFlag) {
	  if (errorFlag) {
	    var content = 'Error: The Geolocation service failed.';
	  } else {
	    var content = 'Error: Your browser doesn\'t support geolocation.';
	  }

	  var options = {
	    map: map,
	    position: new google.maps.LatLng(60, 105),
	    content: content
	  };

	  var infowindow = new google.maps.InfoWindow(options);
	  map.setCenter(options.position);
	}
	  	// google.maps.event.addListener(map, 'click', addMarker);


	google.maps.event.addDomListener(window, 'load', initialize);
});