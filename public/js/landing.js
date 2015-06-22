$(function() {
  var map;
	function initialize() {
    map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 13,
      center: {lat: 37.5542, lng: -122.3131}
 		});

  	var mapDiv = document.getElementById('map-canvas');

  	// google.maps.event.addListener(map, 'click', addMarker);
	}

	initialize();
});