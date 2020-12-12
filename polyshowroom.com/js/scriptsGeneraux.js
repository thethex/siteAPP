
// When the user scrolls adjust menu size background... so that it stays readable
window.onscroll = function() {scrollFunction()};


var menuFixe=false;
var margeMaxMenu=100;

function scrollFunction() {
	modifMenu();
	chargeElements();
} 

function modifMenu(){

		if (!menuFixe && document.documentElement.scrollTop < 100) {
			$("#conteneurBarreNavigation").css("top",margeMaxMenu-document.documentElement.scrollTop +"px")
			document.getElementById("conteneurBarreNavigation").style.background="none";	
		}else{
			$("#conteneurBarreNavigation").css("top","0px");
			document.getElementById("conteneurBarreNavigation").style.background="rgb(30,30,35)";
		}
		
		$("#menus").css("height",64+2*margeMaxMenu+"px");
	
}

var ecrans=["ecrans"];
function chargeElements(){
	   var withinViewportArray = $('.chargeable').percentWithinViewport();
	   
	   $.each(withinViewportArray, function(index){
		   
		   $.each(ecrans, function(index2){
			   //console.log(withinViewportArray[index]);
			   //console.log(    ecrans[index2]);
			
				if(withinViewportArray[index] == ecrans[index2]){
					
					chargerEcran(ecrans[index2]);
					ecran.splice(index2, 1)
				}
			});			  
	   });
};



$(window).resize(function(){
	resize();
});
function resize(){
	
	//premiere zone : 0-1240px
	if ($( window ).width()<1240){
		$(".ecran").css("height", ($( window ).width()+630)*9/16 +"px");
	}else{
		$(".ecran").css("height","970px");
	}
	
	
	if ($( window ).width()<1240 && 940<$( window ).width()){
		margeMaxMenu=100-(1240-$( window ).width())/3;
		menuFixe=false;
		modifMenu();
		
	}else if(940>$( window ).width()){
			margeMaxMenu=0;
		menuFixe=true;
		modifMenu();
	}
};
	

 
var boutonMenuCroix=false;

$(document).ready(function(){$('#boutonOuvertureMenu').click(function(){
	
	if(boutonMenuCroix){
		boutonMenuCroix=false;
		$("#croixMenuHaut").css( "transform"," skewY(0deg)");
		$("#croixMenuHaut").css( "top"," 0px");
		$("#croixMenuHaut").css( "height"," 4px");
		document.getElementById("croixMenuMilieu").style.width="100%";
		$("#croixMenuBas").css( "transform"," skewY(0deg)");
		$("#croixMenuBas").css( "top","calc(100% - 4px)");
		$("#croixMenuBas").css( "height"," 4px");
	}else{
		boutonMenuCroix=true;
		$("#croixMenuHaut").css( "transform"," skewY(-45deg)");
		$("#croixMenuHaut").css( "top"," calc(50% - 2px)");
		$("#croixMenuHaut").css( "height"," 6px");
		document.getElementById("croixMenuMilieu").style.width="0%";
		$("#croixMenuBas").css( "top"," calc(50% - 2px)");
		$("#croixMenuBas").css( "transform"," skewY(45deg)");
		$("#croixMenuBas").css( "height"," 6px");
	}
	
});});


//appel au fonction modifiant le visuel au chargement de la page (en cas de rechargement)
  document.addEventListener("ready",onDocumentLoaded());
function onDocumentLoaded(){
	 resize() ;modifMenu();
}



//animations de chargement
	$('#imgSalon').on('load',function(){
		console.log('ready');
		$('#imSalon').css("width", "100%");
		$('#conteneurZoneTextSalon').css("width", "100%");
		$('#texteSalon').css("color","rgb(30,30,30,1)");
	});
window.onload = function () {
	console.log('ready');
	$('#imgSalon').on('load',function(){
		console.log('ready');
		$('#imSalon').css("width", "100%");
		$('#conteneurZoneTextSalon').css("width", "100%");
		$('#texteSalon').css("color","rgb(30,30,30,1)");
	});

};


attente=0;

	console.log('ready');
	$('.ImageColumnIns').on('load',function(){
		console.log('im');
		$(this).parent().css("-webkit-transition","1.5s");
		$(this).parent().css("transition-delay",""+attente+"ms");
		$(this).parent().css("opacity","1");
		attente=attente+200;
	});

