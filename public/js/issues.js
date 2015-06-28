$(function() {

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