$(function() {

// =====================================
// CLIENT SIDE VOTING SYSTEM ===========
// =====================================

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



//TODO - FINISH BUILDING ISSUE NUMBER SEARCH BOX
// =====================================
// ISSUE NUMBER SEARCH BOX =============
// =====================================

//  $('#textboxId').keypress(function (event) {
//     var keypressed = event.keyCode || event.which;
//     if (keypressed == 13) {
//       event.preventDefault();
//       var searchNum = $('#issueSearch').val();
//       var data = { search: searchNum }
//       console.log(data)

//       $.ajax({
//         type: 'GET',
//         url: '/issues',
//         dataType: 'json',
//         data: data
//       }).done(function (data){
      
//       }); 
//     }
// });

  
   

}); //END OF JS