$(function() {
  var map,
			mapDiv = document.getElementById('map-canvas'),
			infowindow = new google.maps.InfoWindow(); // Global declaration of the infowindow  

	//initializes map, makes an ajax call to my server to get issue locations and data
	function initialize() {
  
		var mapOptions = {
	    zoom: 4,
	    center: {lat: 39.50, lng: -98.35},
	    // mapTypeId: google.maps.MapTypeId.TERRAIN
	   
	  };

	  map = new google.maps.Map(mapDiv,mapOptions);

	  //call to server
	  $.ajax({
        type: 'GET',
        url: '/',
        dataType: 'json'
    }).done(function (data){
    	console.log(data);
    	var issues = data.issues;
    	//goes in object, loops through array in object, saves data to make a new marker
      issues.forEach(function (issue){
          
        var lat = issue.lat;
        var long = issue.long;
        var title = issue.title;

        var myLatlng = new google.maps.LatLng(lat,long);

        //making the marker. Because markers == JS objects, can set key:value pairs for anything we want to store data. Will use this data to make call out window
        var marker = new google.maps.Marker({
        	position: myLatlng,
          map: map,
          animation: google.maps.Animation.DROP,
          title: title,
          icon: '/assets/mapIcons/apin50.png'
        })
        google.maps.event.addListener(marker, "click", function(){  
  				var content = '<div id="iw-container">' +
												'<div class="iw-title">Issue# ' + issue.issueNum + '</div>' +
												'<div class="iw-content">' +
												'<div class="iw-subTitle"><a href="/issues/' + issue._id +'/">'+ issue.title +'</a></div>' +
												'<img src="'+ issue.image + '" alt="Issue Image" onerror="this.src="/assets/noImg.jpg" height="115" width="83">' +
												'<p>'+ issue.description +'</p>' + 
												'<div class="iw-subTitle"> Created by: '+ issue.user.local.username + '</div>' +
												'<p>Votes:' + issue.votes + '</p>'+
												'<p>Created on: ' + issue.dateCreated + '</p>'+
												'</div>' +
												'<div class="iw-bottom-gradient"></div>' +
												'</div>';

  				infowindow.close()  
    			infowindow.setContent(content);  
      		infowindow.open(map, marker);				 
  			});  
      })
    })	  
		
		google.maps.event.addListener(map, 'zoom_changed', function (e){
			
		});

	};

	//run initialize, generate map, populate markers and infowindow data
	initialize();

	//TODO - instead of loading all at once, make it load as needed






	//geo-locate function on button click
	$('#locate-me').click(function(){
		  if(navigator.geolocation) {
		  	//TODO - add in a loading screen over map while location is found
		    navigator.geolocation.getCurrentPosition(function(position) {
		      var pos = new google.maps.LatLng(position.coords.latitude,
		      																 position.coords.longitude);

		      //place a moveable pin on users location
		      var myLocation = new google.maps.Marker({
		        map: map,
		        position: pos,
		        animation: google.maps.Animation.DROP,
		        title: 'My Location',
		        draggable: true,
		        icon: '/assets/mapIcons/mepin.png'
		      });
		      //zoom to users location
		      //TODO - end loading screen
		      map.setCenter(pos);
		      map.setZoom(17);
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

	  var infowindow = new google.maps.InfoWindow(options);
	  map.setCenter(options.position);
	}

	//styles infowindows -- taken from http://codepen.io/Marnoto/pen/xboPmG
	google.maps.event.addListener(infowindow, 'domready', function() {

    // Reference to the DIV that wraps the bottom of infowindow
    var iwOuter = $('.gm-style-iw');

    /* Since this div is in a position prior to .gm-div style-iw.
     * We use jQuery and create a iwBackground variable,
     * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
    */
    var iwBackground = iwOuter.prev();

    // Removes background shadow DIV
    iwBackground.children(':nth-child(2)').css({'display' : 'none'});

    // Removes white background DIV
    iwBackground.children(':nth-child(4)').css({'display' : 'none'});

    // Moves the infowindow 115px to the right.
    iwOuter.parent().parent().css({left: '115px'});

    // Moves the shadow of the arrow 76px to the left margin.
    iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

    // Moves the arrow 76px to the left margin.
    iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

    // Changes the desired tail shadow color.
    iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

    // Reference to the div that groups the close button elements.
    var iwCloseBtn = iwOuter.next();

    // Apply the desired effect to the close button
    iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid rgb(38,129,206)', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});

    // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
    if($('.iw-content').height() < 140){
      $('.iw-bottom-gradient').css({display: 'none'});
    }

    // The API automatically applies 0.7 opacity to the button after the mouseout event. This function reverses this event to the desired value.
    iwCloseBtn.mouseout(function(){
      $(this).css({opacity: '1'});
    });
  });


	//SEARCHES GOOGLE MAPS FOR ADDRESS OR LOCATION, AND ZOOMS TO THAT PLACE
	$('#form-control').submit(function (e) {
      e.preventDefault();
      var getAddress = $('#address-search').val();
      var getState = $('#states').val();
      var address = encodeURIComponent(getAddress + ', ' + getState);
      console.log(address);
      var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';
      var gk = 'AIzaSyAeeC94VEj-4SfsDUOOhqnRjIo-KnbK1Mw';

      
      $.ajax({
        type: 'GET',
        url: url + address + gk,
        dataType: 'json'
    	}).done(function (data){
    		// console.log(data);
    		var lat = data.results[0].geometry.location.lat;
        var long = data.results[0].geometry.location.lng;
    		var pos = new google.maps.LatLng(lat, long);
    		map.setCenter(pos);
		    map.setZoom(12);
    	});	
  });  

	  $('.voteUp').click(function (e){
	  	$(this).attr('src', "/assets/thumbs/tuclicked.png");
	  	$(this).attr('class', "clicked")
		 	var id = $(this).attr('data-id');
		  	
	  	$.ajax({
	  		type: 'PUT',
	  		url: '/issues/' + id + '/',
	  		dataType: 'json'
	  	}).done (function (){
	  		
	  	}).fail(function (err){
	  			$( "<p>Issue voted on already!</p>" ).insertBefore('.clicked');
	  			$('.clicked').replaceWith('<img src="/assets/thumbs/Ximg.png" alt="voted!" id="alreadyVoted">'); 		
	  	})
	  }); 
	
});