
//variables


var xPers=yPers=0;
var xTable=yTable=0;

var t=0;
var imgFond= new Image();
var imgTable= new Image();
var imgPers = new Image();
var widthCanvas=heightCanvas=0;


//permet de svoir si les élements on été déplacé
var changement=0;

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
	objects.push( {x:0, y:0, width:192, height:192, image:imgTable , nom:"table"} );
	objects.push( {x:1500, y:100, width:115, height:54, image:imgPers, nom:"personne"} );
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

	setInterval(simule,50);
	
	//fonction permetant de lancer la simulation

	
}

 imgFond.onload = function() {
   	 dessine();
  };

function simule(){
	// traitements physiques de la simulation (détection pour la majorité)
	
	if(changement==1){
		res="";
		for(var i=0;i<16;i++){
			 res+= calculRetourCapteur(i);
   	 	}
		document.getElementById("valCapteurs").innerHTML=res;
		document.getElementById("nomSelection").innerHTML=objects[selectedObjectIndex].nom;
		dessine();
		changement=0;
	}
	
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
		//ABCDt=ABCD translaté pour que l'origine soit la table
	   	ABCDt=calculAnglesPointsObjet(ABCD);
		capteurs[indice]=intersectionUltrason(indice,ABCDt);
		res="capteur "+indice+"  distance : "+capteurs[indice]+"  |";
	}
	return res;
	
}




function dessine(){
	
	//console.log("DESSINE/n");
		
	
	ctx.drawImage(imgFond,0,0,1920,1080);
	

	drawUltrasZones();
	drawAllobjects();


}


anglesObjet=[0,0,0,0];

function calculAnglesPointsObjet(ABCDint){
	
	//ontrouve le milieu de la table pour translaté l'origine du repere 
	var object=objects[0];
	milieuX=object.x+94;
	milieuY=object.y+94;
	
	for(var i=0;i<4;i++){
		//pour le calcul d'angle on prend le vecteur (1,0)
		ABCDint[i*2]=ABCDint[i*2]-milieuX;
		ABCDint[i*2+1]=ABCDint[i*2+1]-milieuY;
		anglesObjet[i]=(180/Math.PI)*Math.acos(   ABCDint[i*2]/(   Math.sqrt(ABCDint[i*2]*ABCDint[i*2]+ABCDint[i*2+1]*ABCDint[i*2+1])) );
		if(-ABCDint[i*2+1]<0){
			anglesObjet[i]=360-anglesObjet[i];	
		}
	//console.log("  angle "+i+ " : "+anglesObjet[i]+"  | ");
	}
	return ABCDint;
}


function intersectionUltrason(indice,ABCDt){
	//on projete les 4 points sur la droite la plus proche si besoin
	res=-1;
	nombreProjections=4;
	
	sommeApres=0;
	sommeAvant=0;
	angleUltra=indice*22.5+11.25;
	nombrePointsProjetables=4;
	
	//0=pas à projeter , 1=à projeter ; -1=point hors zone de projection
	aProjeter=[-1,-1,-1,-1];
	
	for(var i=0;i<4;i++){
		anglePoint=anglesObjet[i];
		diffAngle = (anglePoint+angleUltra+360+180)%360-180;
		if(-7.5< diffAngle && diffAngle<7.5 ){
		 //dans la zone de la zone
			nombreProjections--;	
			aProjeter[i]=0;
		}else if(-90< diffAngle && diffAngle<90){
			// si l'angle est du bon coté (pas dans la moitiée de disque en miroir) on enregistre si il est supérieur ou inférieur aux angle de la zone (si les 4 angle sont sup ou inf l'objet est à l'extérieur)
		   	aProjeter[i]=1;
			if(diffAngle/Math.abs(diffAngle)==1){
				sommeApres++;		
			}else{
				sommeAvant++;
			}
		}else{
		// l'angle n'est pas projetable si les deux points adjacences ne le sont pas
			aProjeter[i]=1;
			nombrePointsProjetables--;
		}
	}
	
	//console.log("  variations  : "+sommeVariationsNormalisees+"   nb points projetables  :  "+nombrePointsProjetables+"  | ");

		
	if(  (nombrePointsProjetables!=0) && ((nombreProjections<4) || (sommeAvant!=4 && sommeApres!=4 && (sommeAvant+sommeApres)==4) )){

	   // on peut calculer une distance si au moins un point est projetable et soit un point soit dans la zone ou que au moin un point est de l'autre coté de la zone par rapport aux autres (deux segments taversent la zone)
				////console.log("indice "+indice+" :"+nombrePointsProjetables +":"+ nombreProjections+":"+  sommeAvant +":"+sommeApres +"  | ");
		
		//C'est le moment de s'amuser il faut calculer la distance min du cateur, pour ça on projete les points en dehors de la zone sur celle-ci suivant le segment qui offrira la plus courte projection
		//le point le plus proche est celui qu'on recherche
		res=100000;
		
		
		
		for(var i=0;i<4;i++){
			distanceBoucle=-1;
			anglePoint=anglesObjet[i];
			diffAngle = (anglePoint+angleUltra+360+180)%360-180;
			if(aProjeter[i]==0){
		 		//dans la zone 
				
				distanceBoucle= Math.sqrt(ABCDt[i*2]*ABCDt[i*2]+ABCDt[i*2+1]*ABCDt[i*2+1]);
				if(distanceBoucle<res){
				   res=distanceBoucle;
				 }
				   
				
				
			}else{
				//a projeter
				
				//h : indice point précedent
				h=(i-1)%4;
				//j : indice point précedent
				j=(i+1)%4;
				
				distanceProjHAV=-1;
				distanceProjJAV=-1;
				distanceProjHAP=-1;
				distanceProjJAP=-1;
				
				
				coefDirectAP=Math.tan( (angleUltra+7.5)*Math.PI/180);
				coefDirectAV=Math.tan( (angleUltra-7.5)*Math.PI/180);
				
				indiceDistanceProjMin=-1;
				
				b=0;
				a=0;
				
				//contient coordonnees x y des 4 projections calculées on decide laquelle prendre à la fin
				coordProj=[0,0,0,0,0,0,0,0];
				
				projection=0;
				
		   	    if(aProjeter[i] == -1 && aProjeter[j] == -1 && aProjeter[h] == -1){
					// le point n'est relié à aucun point dans le demi disque qui nous interesse aucune projection possible	
				}else {
					   //on calcul l'intersection du segment j/h i avec les deux droites délimitant la zone de detectionpuis on gardera le point dont la distance avec i est la plus faible (i sera égal à se point)
						//si on ne trouve pas d'intersectionon sautera le test de distance avec le res
					if(  -2<(aProjeter[i]+aProjeter[j])){
					//le point est relié au point j et au moins un des deux est dans le demi-cercle
						
						//on calcul l'équation de  droite colineaire au segment pour pouvoir calculer le point d'intersection
						
						a = (ABCDt[j*2+1] - ABCDt[i*2+1] ) / (ABCDt[j*2] - ABCDt[i*2]);
						b = ABCDt[j*2+1] - ABCDt[j*2]*a;
						//on test les projections sur les deux bords de la zone de detection
						
						coordProj[0] = b / (coefDirectAV - a);
						coordProj[1] = coordProj[0]*coefDirectAV;
						distanceProjJAV= Math.sqrt(Math.pow(coordProj[0]-ABCDt[i*2],2)+Math.pow(coordProj[1]-ABCDt[i*2+1],2));
						
						
						
						coordProj[2] = b / (coefDirectAP - a);
							coordProj[3] = coordProj[2]*coefDirectAP;
				   		distanceProjJAP= Math.sqrt(Math.pow(coordProj[2]-ABCDt[i*2],2)+Math.pow(coordProj[3]-ABCDt[i*2+1],2));
					
						projection=1;
					}
					if(  -2<(aProjeter[i]+aProjeter[h])){
					//le point est relié au point h et au moins un des deux est dans le demi-cercle
						
						//on calcul l'équation de  droite colineaire au segment pour pouvoir calculer le point d'intersection
						
						a = (ABCDt[h*2+1] - ABCDt[i*2+1] ) / (ABCDt[h*2] - ABCDt[i*2]);
						b = ABCDt[h*2+1] - ABCDt[h*2]*a;
						//on test les projections sur les deux bords de la zone de detection
						
						coordProj[4] = b / (coefDirectAV - a);
						coordProj[5] = coordProj[4]*coefDirectAV;
						distanceProjHAV= Math.sqrt(Math.pow(coordProj[4]-ABCDt[i*2],2)+Math.pow(coordProj[6]-ABCDt[i*2+1],2));
						
						
						coordProj[6] = b / (coefDirectAP - a);
						coordProj[7] = coordProj[6]*coefDirectAP;
						distanceProjHAV= Math.sqrt(Math.pow(coordProj[6]-ABCDt[i*2],2)+Math.pow(coordProj[7]-ABCDt[i*2+1],2));
					
						projection=1;
					
					}
					
					//on determine le point avec la projection la plus courte	
						if(0<distanceProjJAV && distanceProjJAV<res){
						   indiceDistanceProjMin=0;
						 }
						if(0<distanceProjJAP && distanceProjJAP<res){
						   indiceDistanceProjMin=1;
						 }
						if(0<distanceProjHAV && distanceProjHAV<res){
						   indiceDistanceProjMin=2;
						 }
						if(0<distanceProjHAP && distanceProjHAP<res){
						   indiceDistanceProjMin=3;
						 }
					
					
					if(projection==1){
						
						distanceBoucle= Math.sqrt(Math.pow(ABCDt[indiceDistanceProjMin*2],2)+Math.pow(ABCDt[indiceDistanceProjMin*2+1],2));
						if(distanceBoucle<res){
				   		res=distanceBoucle;
						}
				 	}
					
				}
			}
		}
		
		//si le point le plus proche est en dehors du range du capteur on met le res à -1
		if(810<res){
			res=-1;
		}
	
	
	}else{
		//objet hors sujet
		nombreProjections=4;
	}
	
	return res ;
}

coefDb=Math.tan((-7.5)*Math.PI/180) ;
coefDh=Math.tan(7.5*Math.PI/180) ;



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
	changement=1;
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
	if(capteurs[(angle-11.25)/22.5]==-1){
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