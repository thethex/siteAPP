
//variables


xPers=yPers=0;
xTable=yTable=0;

var t=0;
imgFond= new Image();
imgTable= new Image();
imgPers = new Image();
widthCanvas=heightCanvas=0;


// valeurs des capteurs dans le sens anti horaire
var capteurs=[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];

// save relevant information about shapes drawn on the canvas
var objects=[];

// drag related vars
var isDragging=false;
var startX,startY;

// hold the index of the shape being dragged (if any)
var selectedObjetsIndex;

var offsetX,offsetY;


//largeur canvas divisée par largeur affichée (on ré appliquera aussi pour la largeur car les valeurs sont quasiement égales)
var rapport;

window.onload=function(){
	imgFond.src="ressources/fondSimulation.jpg";
	imgTable.src="ressources/table.png";
	imgPers.src="ressources/personne.png";
	objects.push( {x:0, y:0, width:192, height:192, image:imgTable} );
	objects.push( {x:1500, y:100, width:115, height:54, image:imgPers} );
	canvas=document.getElementById("canvasSimulation");

	reOffset();
	ctx=canvas.getContext("2d");
	canvas.onmousedown=handleMouseDown;
    canvas.onmousemove=handleMouseMove;
    canvas.onmouseup=handleMouseUp;
    canvas.onmouseout=handleMouseOut;
	window.onscroll=function(e){ reOffset(); }
	window.onresize=function(e){ reOffset(); }
	canvas.onresize=function(e){ reOffset(); }

	setInterval(simule,500);
	
	//fonction permetant de lancer la simulation

	
}

 imgFond.onload = function() {
   	 dessine();
  };

function simule(){
	// traitements physiques de la simulation (détection pour la majorité)
	
	dessine();
	res="";
		 for(var i=0;i<16;i++){
			
			 res+= calculRetourCapteur(i);
    }
	document.getElementById("valCapteurs").innerHTML=res;
	
}


function calculRetourCapteur(indice){
	res="";
	angle=(indice*22.5+11.25)*Math.PI/180;
	
	
	for(var i=1;i<objects.length;i++){
		object=objects[i];
		
		//B  C
		//
		//A  D
		ABCD=[object.x,object.y,object.x+object.width,object.y,object.x+object.width,object.y+object.height,object.x,object.y+object.height];
	    ABCDb=[0,0,0,0,0,0,0,0];
		ABCDb=changementBaseRotation(angle,ABCD);
		capteurs[indice]=intersectionUltrason(ABCDb,indice);
		//res+="capteur "+angle+"  distance : "+capteurs[indice]+"  |";
	}
	return res;
	
}




function dessine(){
	
	console.log("DESSINE/n");
		
	
	ctx.drawImage(imgFond,0,0,1920,1080);
	

	drawUltrasZones();
	drawAllobjects();


}


function intersectionUltrasonAngle(ABCDint,indice){
	//on projete les 4 points sur la droite la plus proche si besoin
	res=-1;
	nombreProjections=4;
	sommeX=0;
	angleMax=indice*22.5+11.25+7.5;
	angleMin=indice*22.5+11.25-7.5;
	//ontrouve le milieu de la table pour translaté l'origine du repere 
	var object=objects[0];
	milieuX=object.x+94;
	milieuY=object.y+94;
	nombrePointsProjetables=4;
	
	
	for(var i=0;i<4;i++){
		//pour le calcul d'angle on prend le vecteur (1,0)
		anglePoint=ABCDint[i*2]/(   Math.sqrt(ABCDint[i*2]*ABCDint[i*2]+1)   *  Math.sqrt(ABCDint[i*2+1]*ABCDint[i*2+1]));
		console.log("capteur "+indice*22.5+11.25+"  angle: "+anglePoint+"  |");
		if(coefI<angleMin || angleMax<coefI){
		 //hors de la zone
		}else{
			nombreProjections--;
		}
		if(coefI<(angleMin-90)|| (angleMax+90)<coefI){
		 //hors de la zone ou les points sont projetés
		}else{
			nombreProjections--;
		}
	
	}

		
	if(0<=sommeX && (nombreProjections<4 ){
	   //dans le cas on on a pas 4 projections et que au moins 1 x est (dans quel cas on est en dehors de la zone)
		nombreProjections=1;
	 
	for(var i=0;i<4;i++){
		coefI=ABCDint[i*2+1]/ABCDint[i*2];
		nombreProjections=1;
		//oncherche si il faut projeter le point, si c'est le cas on aura deux projections à étudier avec les deux segment auquels sont relié le point
		if(coefI<coefDb){
		   //point sous la zone
		   //on projete sur la droite du bas
			
			
		}else if(coefDh<coefI){
			//point haut dessus de la zone
			//on projete sur la droite du haut
			
			
		}else{
			//point dans la zone
			//on ne cherche pas à le projeter	
			
		}
	}
	}else{
		nombreProjections=4;
	}
	
	return nombreProjections ;
}

coefDb=Math.tan((-7.5)*Math.PI/180) ;
coefDh=Math.tan(7.5*Math.PI/180) ;

function intersectionUltrason(ABCDint,indice){
	//on projete les 4 points sur la droite la plus proche si besoin
	//dans la nouvelle base les droites on tjrs la même equation de droite y=x*tan(7.5°) y=x*tan(-7.5°)
	res=-1;
	nombreProjections=4;
	sommeX=0;
	moyenneCoefI=0;
	
	
	
	for(var i=0;i<4;i++){
		coefI=ABCDint[i*2+1]/ABCDint[i*2];
		sommeX+=ABCDint[i*2];
		moyenneCoefI+=coefI;
		if(coefI<coefDb || coefDh<coefI){
		 //hors de la zone
			
		}else{
			nombreProjections--;
		}
	
		//console.log("capteur : "+indice+"  angle : "+(indice*22.5+11.25)+" B : "+coefDb +" H : " +coefDh+" I : "+ coefI);
	}
	moyenneCoefI=moyenneCoefI/4;
		console.log("capteur "+indice*22.5+11.25+"  somme: "+moyenneCoefI+"  |");
		//console.log("capteur : "+indice+" nbProj : "+nombreProjections);
	if(0<=sommeX && (nombreProjections<4 || (coefDb < moyenneCoefI && moyenneCoefI<coefDh) )){
	   //dans le cas on on a pas 4 projections et que au moins 1 x est (dans quel cas on est en dehors de la zone)
		nombreProjections=1;
	 
	for(var i=0;i<4;i++){
		coefI=ABCDint[i*2+1]/ABCDint[i*2];
		nombreProjections=1;
		//oncherche si il faut projeter le point, si c'est le cas on aura deux projections à étudier avec les deux segment auquels sont relié le point
		if(coefI<coefDb){
		   //point sous la zone
		   //on projete sur la droite du bas
			
			
		}else if(coefDh<coefI){
			//point haut dessus de la zone
			//on projete sur la droite du haut
			
			
		}else{
			//point dans la zone
			//on ne cherche pas à le projeter	
			
		}
	}
	}else{
		nombreProjections=4;
	}
	
	return nombreProjections ;
}


function changementBaseRotation(angle,ABCD){
	//ABCD de la forme [xA,yA...] angle en rad
	//on recuperera la position de la table en partant du principe qu'elle est en premiere place (à améliorer) 	
	//objects.[0]
	//on calcul la position du centre de la table
	//trois modifications : une translation pour que la table devienne l'origine et une rotation pour simplifier le calcul de minimum
	//et remise droit du a l'axe y dans  le mauvais sens vers le bas les projection y sont donc inversées
	var object=objects[0];
	milieuX=object.x+94;
	milieuY=object.y+94;
	 ABCDr=[0,0,0,0,0,0,0,0];
	for(var i=0;i<4;i++){
		ABCDr[i*2]=Math.cos(angle)*(ABCD[i*2]-milieuX)-Math.sin(-angle)*(ABCD[i*2+1]-milieuY);
		
		ABCDr[i*2+1]=Math.sin(-angle)*(ABCD[i*2]-milieuX)+Math.cos(angle)*(ABCD[i*2+1]-milieuY);
	}
	//ctx.globalAlpha = 0.8;

	//ctx.fillStyle="green";
	//ctx.beginPath();
    //ctx.moveTo(ABCDr[0], ABCDr[1]);
    //ctx.lineTo(ABCDr[2], ABCDr[3]);
    //ctx.lineTo(ABCDr[4], ABCDr[5]);
	//ctx.lineTo(ABCDr[6], ABCDr[7]);
	//ctx.fill();
	return ABCDr;
}

function pointPlusProche(x,y,ABCD){
	
	
}

// used to calc canvas position relative to window
function reOffset(){
    var BB=canvas.getBoundingClientRect();
	rapport=widthCanvas=document.getElementById("simulation").clientWidth/1980;
    offsetX=BB.left;
    offsetY=BB.top;  
	
}




function isMouseInObject(mx,my,object){
    // is this shape an image?
    if(object.image){
        // this is a rectangle
        var rLeft=object.x;
        var rRight=object.x+object.width;
        var rTop=object.y;
        var rBott=object.y+object.height;
        // math test to see if mouse is inside image
        if( mx/rapport>rLeft && mx/rapport<rRight && my/rapport>rTop && my/rapport<rBott){
            return(true);
        }
    }
    // the mouse isn't in any of this shapes
    return(false);
}

function handleMouseDown(e){
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position
    startX=parseInt(e.clientX-offsetX);
    startY=parseInt(e.clientY-offsetY);
    // test mouse position against all shapes
    // post result if mouse is in a shape
    for(var i=0;i<objects.length;i++){
        if(isMouseInObject(startX,startY,objects[i])){
            // the mouse is inside this shape
            // select this shape
            selectedObjectIndex=i;
            // set the isDragging flag
            isDragging=true;
            // and return (==stop looking for 
            //     further shapes under the mouse)
            return;
        }
    }
}

function handleMouseUp(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
}

function handleMouseOut(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // the drag is over -- clear the isDragging flag
    isDragging=false;
}

function handleMouseMove(e){
    // return if we're not dragging
    if(!isDragging){return;}
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();
    // calculate the current mouse position         
    mouseX=parseInt(e.clientX-offsetX);
    mouseY=parseInt(e.clientY-offsetY);
    // how far has the mouse dragged from its previous mousemove position?
    var dx=mouseX-startX;
    var dy=mouseY-startY;
    // move the selected shape by the drag distance
    var selectedObject=objects[selectedObjectIndex];
    selectedObject.x+=dx/rapport;
    selectedObject.y+=dy/rapport;
    // clear the canvas and redraw all shapes
	dessine();
    // update the starting drag position (== the current mouse position)
    startX=mouseX;
    startY=mouseY;
}

// clear the canvas and 
// redraw all shapes in their current positions
function drawAllobjects(){
  
    for(var i=0;i<objects.length;i++){
        var object=objects[i];
        if(object.image){
            // it's an image
            ctx.drawImage(object.image,object.x,object.y);
        }
    }
}


function drawUltrasZones(){
	 for(var i=0;i<16;i++){
		 drawUltraZone(i*22.5+11.25,"grey");
    }
}

//rayon en nb de pixel calculé à la main 
distance=810;
milieuX=0;
milieuY=0;
function drawUltraZone(angle,color){
	//on recuperera la position de la table en partant du principe qu'elle est en premiere place (à améliorer) 	
	//objects.[0]
	//on calcul la position du centre de la table
	var object=objects[0];
	milieuX=object.x+94;
	milieuY=object.y+94;
	
	//on passe la transparence à une certaine valeur pour pouvoir voir le fond
	ctx.globalAlpha = 0.2;
	if(capteurs[(angle-11.25)/22.5]==4){
	ctx.fillStyle=color;
	
	   }else{
	  ctx.fillStyle="red"; 
	   }  
	 //on dessine un triangle
	ctx.beginPath();
    ctx.moveTo(milieuX, milieuY);
    ctx.lineTo(milieuX+distance*Math.cos((angle+7.5)*Math.PI/180), milieuY+distance*Math.sin((angle+7.5)*Math.PI/180));
    ctx.lineTo(milieuX+distance*Math.cos((angle-7.5)*Math.PI/180), milieuY+distance*Math.sin((angle-7.5)*Math.PI/180));
	//puis unarc de cercle rempli 
	ctx.arc(milieuX, milieuY,distance,(angle+7.5)*Math.PI/180,(angle-7.5)*Math.PI/180,1);
	ctx.fill();
	ctx.globalAlpha =1;
	
}