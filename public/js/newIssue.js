$(function() {

  var map,
      mapDiv = document.getElementById('map-canvas');
  var geocoder = new google.maps.Geocoder();
      


// ===============================================
// LOAD MAP ==
// ===============================================
//initializes map, makes an ajax call to server to get issue locations and data
  function initialize() {
  
    var mapOptions = {
      zoom: 3,
      center: {lat: 39.50, lng: -98.35},
      // mapTypeId: google.maps.MapTypeId.TERRAIN //Terrain style map, but it doesn't show street names
     
    }; 
    map = new google.maps.Map(mapDiv,mapOptions); //builds map in #map-canvas DIV, with the above options. Current view set to show all of US.
};

initialize();


// ==========================================
// GEOLOCATING USER AND MARKING LOCATION ====
// ==========================================

//geo-locate function on button click
  $('#locate-me').click(function(){
     $('#loader-container').show(); 
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var pos = new google.maps.LatLng(position.coords.latitude,
                                           position.coords.longitude);
          var lat = position.coords.latitude;
          var long = position.coords.longitude;
          var loc = lat + "," + long;
          var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
          var gk = '&key=AIzaSyAeeC94VEj-4SfsDUOOhqnRjIo-KnbK1Mw&result_type=street_address';

          // console.log(loc);
          
          $.ajax({
            type: 'GET',
            url: url + loc + gk,
            dataType: 'json'
          }).done(function (data){
            // console.log(data);
            if (!data.results[0].formatted_address || data.status == "ZERO_RESULTS"){
              $('#address').val("No Address Matching Your Selected Location")
            } else {
              var addy = data.results[0].formatted_address.split(",")
              // var addySplit = address.split(",")
              var address = addy[0]
              var city = addy[1]
              var state = addy[2]
              $('#address').val(address);
              $('#city').val(city);
              $('#state').val(state);
            }       
          });

          //place a moveable pin on users location
          var myLocation = new google.maps.Marker({
            map: map,
            position: pos,
            animation: google.maps.Animation.DROP,
            title: 'My Location',
            draggable: true,
            icon: '/assets/mapIcons/mepin.png'
          })
    
    // ===============================================
    // USING MARKER POSITION TO GET USERS ADDRESS ====
    // ===============================================

          google.maps.event.addListener(myLocation, 'dragend', function (event) {
            var lat = this.getPosition().lat();
            var long = this.getPosition().lng();
            var latlng = lat + "," + long
            var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
            var gk = '&key=AIzaSyAeeC94VEj-4SfsDUOOhqnRjIo-KnbK1Mw&result_type=street_address';

    
            $.ajax({
              type: 'GET',
              url: url + latlng + gk,
              dataType: 'json'
            }).done(function (data){
              if (!data.results[0].formatted_address || data.status == "ZERO_RESULTS"){
                $('#address').val("No Address Matching Your Selected Location")
              } else {
                var addy = data.results[0].formatted_address.split(",")
                // var addySplit = address.split(",")
                var address = addy[0]
                var city = addy[1]
                var state = addy[2]
                $('#address').val(address);
                $('#city').val(city);
                $('#state').val(state);
              }
             
              
           
              
            }); 
          });     
        //zoom to users location
          map.setCenter(pos);
          map.setZoom(17);
          $('#loader-container').hide();
        }, function() {
          handleNoGeolocation(true);
        });
      } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
      }
  });

//error handling if geolocation doesn't work or is denied
  function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
      var content = 'Error: The Geolocation service failed.';
    } else {
      var content = 'Error: Your browser doesn\'t support geolocation.';
    }
    //if geo-locate doesn't work, go back to start view and display error message in a call-out window
    var options = {
      map: map,
      position: new google.maps.LatLng(39.50, -98.35),
      zoom: 8,
      content: content
    };

    var geocoder =   new google.maps.Geocoder();
    var infowindow = new google.maps.InfoWindow(options);
    map.setCenter(options.position);
  }



 
 


}); //END OF JS