




function modifMenu(){

			$("#conteneurBarreNavigation").css("top","0px");
			document.getElementById("conteneurBarreNavigation").style.background="rgb(30,30,35)";
			$("#menus").css("height","64px");
}


function chargeElements(){
	   var withinViewportArray = $('.chargeable').percentWithinViewport();
	   
	   $.each(withinViewportArray, function(index){
		   console.log(withinViewportArray[index]);
		   $.each(ecrans, function(index2){
				if(withinViewportArray[index] == ecrans[index2]){
					
					chargerEcran(ecrans[index2]);
					fruits.splice(index2, 1)
				}
			});			  
	   });
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
	 modifMenu();
}