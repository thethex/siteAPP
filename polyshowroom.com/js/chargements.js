
$(window).on('scroll', function(e) {
	   var withinViewportArray = $('.element').percentWithinViewport();
	
	   $.each(withinViewportArray, function(index) {
	      	image.src = this.src; 
	   });
})
