
$(function() {
  var map,
			mapDiv = document.getElementById('map-canvas'),
      markersArray = []
			infowindow = new google.maps.InfoWindow(); // Global declaration of the infowindow  


// ===============================================
// LOAD MAP, GET ISSUE DATA, BUILD INFO WINDOWS ==
// ===============================================
//initializes map, makes an ajax call to server to get issue locations and data
	function initialize() {
  
		var mapOptions = {
	    zoom: 4,
	    center: {lat: 39.50, lng: -98.35},
	    // mapTypeId: google.maps.MapTypeId.TERRAIN //Terrain style map, but it doesn't show street names
	   
	  };

	  map = new google.maps.Map(mapDiv,mapOptions); //builds map in #map-canvas DIV, with the above options. Current view set to show all of US.

     

// =================================================================
// GET BOUNDS ON MAP IDLE, GEOQUERY DB FOR ISSUES, POPULATE TABLE ==
// =================================================================
//Get bounds of map view on idle event, Query DB based on bounds
//Clear content in table, build HTML string for each issue returned from query
//Append issues to table body via the DOM
		
		google.maps.event.addListener(map, 'idle', function (e){ 
			var bounds = map.getBounds();  //get bounds of current view(NE and SW corner)
      var ne = bounds.getNorthEast(); // LatLng of the north-east corner
      var sw = bounds.getSouthWest(); // LatLng of the south-west corner
      var NE = [ne.lng(), ne.lat()]; //format for mongo geoQuery [long,lat]
      var SW = [sw.lng(), sw.lat()];
      var box =  {
        NE: NE,
        SW: SW
      } 
      // console.log(box);    
      //Make AJAX request, send box of bounds to 
        $.ajax({
          type: 'GET',
          url: '/',
          dataType: 'json',
          data: box
        }).done (function (res){
          // console.log(res);
          var issues = res;

          issues.forEach(function (issue){
          
            var lat = issue.lat; //get lat from issue in DB
            var long = issue.long; //get long from issue in DB
            var title = issue.title; //get title from issue, so when hover over marker title appears.

            var myLatlng = new google.maps.LatLng(lat,long); //set position of marker

            //making the marker. Because markers == JS objects, can set key:value pairs for anything we want to store data. Will use this data to make call out window
            var marker = new google.maps.Marker({
              position: myLatlng,
              map: map,
              // animation: google.maps.Animation.DROP, //map animation, may want to remove. Too many markers could cause lag / choppiness.
              title: title,
              icon: '/assets/mapIcons/apin50.png' //custom map marker
            })
            google.maps.event.addListener(marker, "click", function(){  //add click listener to open info window to each marker
              var content = '<div id="iw-container">' +
                            '<div class="iw-title">Issue# ' + issue.issueNum + '</div>' +
                            '<div class="iw-content">' +
                            '<div class="iw-subTitle"><a href="/issues/' + issue._id +'/">'+ issue.title +'</a></div>' +
                            '<img src="'+ issue.image + '" alt="Issue Image" onerror="this.src="/assets/noImg.jpg" height="115" width="83">' +
                            '<p>'+ issue.description +'</p>' + 
                            '<div class="iw-subTitle"> Created by: '+ issue.user.local.username + '</div>' +
                            '<p>Votes: ' + issue.votes + '</p>'+
                            '<p>Created on: ' + issue.dateCreated + '</p>'+
                            '</div>' +
                            '<div class="iw-bottom-gradient"></div>' +
                            '</div>';

              infowindow.close()  //close all other info windows when a new one is clicked (only one open at a time, reduce screen clutter)
              infowindow.setContent(content);  //populates info window with content HTML string
              infowindow.open(map, marker);   //opens info window  
              markersArray.push(marker);
            });  
          })

          //DYNAMICALLY POPULATING THE TABLE NEXT TO MAP
          $("#tbody").html(" ");

          issues.forEach(function (issue){
            var tableContent = 
              '<tr>' +
              '<td class="issueBox-col1">' + 
              '<div class="issueBox-num"> Issue# <a href="/issues/' + issue._id + '/">' + issue.issueNum + '</a> <div>' +
              '<div class="issueBox-img"><a href="/issues/' + issue._id + '/">';
              
              if (!issue.image || issue.image == ""){
                tableContent+= '<img src="/assets/noImg.jpg" style="width:11vw; height:12vh;"> </a></div>';
              } else {
                tableContent+= '<img src="'+ issue.image + '" style="width:11vw; height:12vh;"> </a></div>' ;
              }
              tableContent+=
              '<div class="issueBox-city">' + issue.city + '</div></td>' +
              '<td class="issueBox-col2">' + 
              '<div class="issueBox-title">' + issue.title + '</div>' +
              '<div class="issueBox-user"> Created by: <a href=" ">' + issue.user.local.username + '</a></div>' +
              '<div class="issueBox-date">' + issue.dateCreated + '</div></td>' +
              '<td class="issueBox-col3">' + 
              '<div class="issueBox-votes"> votes: ' + issue.votes + '</div>';
              if (document.cookie) {
              tableContent += '<div class="issueBox-voteIcon" id="voteIcon"> <img src="/assets/thumbs/tugrey.png" alt="Up-Vote!" class="voteUp" data-id="' + issue._id + '"></div>';
              }
              tableContent+= '</td></tr>';
            // console.log(issue.title);
            $("#tbody").append(tableContent);
          })

// =====================================
// CLIENT SIDE VOTING SYSTEM ===========
// =====================================
//Changes image to blue thumbs up on click, and sends AJAX put request. /issues/:id is listening for AJAX.
//_ID in URL is stored in a data-id tag on the image. Server looks up that issue ID, and checks to see if user has voted for it already (user _ID stored in an array as part of issue schema).
//If user ID is in array, server returns an error, which is handled by AJAX .fail callback. If user hasn't voted, thumbs stays blue. Server increments votes count, and adds user _ID to array.
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
        })   			
		});

	}; //end of initialize function

	//auto run initialize, generate map, populate markers and infowindow data, create listener on map idle
	initialize();

	//TODO - instead of loading all at once, make it load as needed?




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

		      //place a moveable pin on users location
		      var myLocation = new google.maps.Marker({
		        map: map,
		        position: pos,
		        animation: google.maps.Animation.DROP,
		        title: 'My Location',
		        icon: '/assets/mapIcons/mepin.png'
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

	  var infowindow = new google.maps.InfoWindow(options);
	  map.setCenter(options.position);
	}


// =====================================
// CUSTOM / STYLED MAP INFO WINDOWS ====
// =====================================
//style for infowindows -- taken from http://codepen.io/Marnoto/pen/xboPmG
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

// =====================================
// SEARCH BAR ON MAP ===================
// =====================================

	//SEARCHES GOOGLE MAPS FOR ADDRESS OR LOCATION, AND ZOOMS TO THAT PLACE
	$('#form-control').submit(function (e) {
      e.preventDefault();
      var getAddress = $('#address-search').val();
      var getState = $('#states').val();
      var address = encodeURIComponent(getAddress + ', ' + getState);
      // console.log(address);
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




});