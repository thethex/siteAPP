
//variables


var xPers=yPers=0;
var xTable=yTable=0;

var t=0;
var imgFond= new Image();
var imgTable= new Image();
var imgPers = new Image();
var widthCanvas=heightCanvas=0;


//rayon en nb de pixel calculé à la main 
rapportTailleCase=135;//135px pour 50cm
ecartCentre= rapportTailleCase*3/8;
porteeUltra=810+ecartCentre;

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
var selectedObjetIndex;

var offsetX,offsetY;


//largeur canvas divisée par largeur affichée (on ré appliquera aussi pour la largeur car les valeurs sont quasiement égales)
var rapport;

////norme pour les points:
//	A-B			^
//	| |			|
//	D-C		  !-Y!
//


window.onload=function(){
	imgFond.src="ressources/fondSimulation.jpg";
	imgTable.src="ressources/table.png";
	imgPers.src="ressources/personne.png";
	objects.push( {Ax:0, Ay:0, Bx:192, By:0, Cx:192, Cy:192, Dx:0, Dy:192, image:imgTable , nom:"table"} );
	objects.push( {Ax:1500, Ay:100, Bx:1615, By:100, Cx:1665, Cy:154, Dx:1450, Dy:154, image:imgPers, nom:"personne"} );
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
		
		//A  B
		//
		//D  C
		ABCD=[object.Ax,object.Ay,object.Bx,object.By,object.Cx,object.Cy,object.Dx,object.Dy];
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
	var table=objects[0];
	milieuX=table.Ax+94;
	milieuY=table.Ay+94;
	
	
	
	for(var i=0;i<4;i++){
		
		//pour le calcul d'angle on prend le vecteur (1,0)
		ABCDint[i*2]=ABCDint[i*2]-milieuX;
		ABCDint[i*2+1]=ABCDint[i*2+1]-milieuY;
		anglesObjet[i]=(180/Math.PI)*Math.acos(   ABCDint[i*2]/(   Math.sqrt(ABCDint[i*2]*ABCDint[i*2]+ABCDint[i*2+1]*ABCDint[i*2+1])) );
		if(-ABCDint[i*2+1]<0){
			anglesObjet[i]=360-anglesObjet[i];	
		}
		//console.log(noms[i]+" : "+anglesObjet[i]+" / "); 
	
	}
	
	return ABCDint;
}


function intersectionUltrason(indice,ABCDt){
	//on projete les 4 points sur la droite la plus proche si besoin
	
	//LA FONCTION A ETE DEBUGGEES DONC A PAR BUGS DE < OU <= NORMALEMENT CA FONCTIONNE
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
	
	

		
	if(  (nombrePointsProjetables!=0) && ((nombreProjections<4) || (sommeAvant!=4 && sommeApres!=4 && (sommeAvant+sommeApres)==4) )){
	   // on peut calculer une distance si au moins un point est projetable et soit un point soit dans la zone ou que au moin un point est de l'autre coté de la zone par rapport aux autres (deux segments taversent la zone)
				////console.log("indice "+indice+" :"+nombrePointsProjetables +":"+ nombreProjections+":"+  sommeAvant +":"+sommeApres +"  | ");
		
		//C'est le moment de s'amuser il faut calculer la distance min du cateur, pour ça on projete les points en dehors de la zone sur celle-ci suivant le segment qui offrira la plus courte projection
		//le point le plus proche est celui qu'on recherche
		
		//INFO DEBUG LES BON CAPTEUR ET BONS POINTS SONT A PROJETER
		res=100000;
		
		noms=["A","B","C","D"];
		
		
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
				//j : indice point suivant
				j=(i+1)%4;
				
				//INFO DEBUG : h et j FONCTIONNENT
				
				
				distanceProjHAV=-1;
				distanceProjJAV=-1;
				distanceProjHAP=-1;
				distanceProjJAP=-1;
				
				
				//INFO DEBUG BONS COEFS
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
					
					resProj=10000;
					if(  -2<(aProjeter[i]+aProjeter[j])){
					//le point est relié au point j et au moins un des deux est dans le demi-cercle
						
						//on calcul l'équation de  droite colineaire au segment pour pouvoir calculer le point d'intersection
						
						a = (ABCDt[j*2+1] - ABCDt[i*2+1] ) / (ABCDt[j*2] - ABCDt[i*2]);
						b = ABCDt[j*2+1] - ABCDt[j*2]*a;
						//on test les projections sur les deux bords de la zone de detection
						
						coordProj[0] = b / (coefDirectAV - a);
						coordProj[1] = coordProj[0]*coefDirectAV;
						distanceProjJAV= Math.sqrt(Math.pow(coordProj[0],2)+Math.pow(coordProj[1],2));
						
						
						
						coordProj[2] = b / (coefDirectAP - a);
						coordProj[3] = coordProj[2]*coefDirectAP;
				   		distanceProjJAP= Math.sqrt(Math.pow(coordProj[2],2)+Math.pow(coordProj[3],2));
					
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
						distanceProjHAV= Math.sqrt(Math.pow(coordProj[4],2)+Math.pow(coordProj[6],2));
						
						
						coordProj[6] = b / (coefDirectAP - a);
						coordProj[7] = coordProj[6]*coefDirectAP;
						distanceProjHAV= Math.sqrt(Math.pow(coordProj[6],2)+Math.pow(coordProj[7],2));
					
						projection=1;
					
					}
					//on calcul si les projections sont valides (si on est bien dans le segment
					JAVvalide=!((coordProj[0]<ABCDt[j*2] && coordProj[0]<ABCDt[i*2])  || (coordProj[0]>ABCDt[j*2] && coordProj[0]>ABCDt[i*2]));
					JAPvalide=!((coordProj[2]<ABCDt[j*2] && coordProj[2]<ABCDt[i*2])  || (coordProj[2]>ABCDt[j*2] && coordProj[2]>ABCDt[i*2]));
					HAVvalide=!((coordProj[4]<ABCDt[h*2] && coordProj[4]<ABCDt[i*2])  || (coordProj[4]>ABCDt[h*2] && coordProj[4]>ABCDt[i*2]));
					HAPvalide=!((coordProj[6]<ABCDt[h*2] && coordProj[6]<ABCDt[i*2])  || (coordProj[6]>ABCDt[h*2] && coordProj[6]>ABCDt[i*2]));
					
					//on determine le point avec la projection avec la distance la plus proche du centre	
					
						if(0<distanceProjJAV  && distanceProjJAV< resProj && JAVvalide){
						   indiceDistanceProjMin=0;
							resProj=distanceProjJAV;
						 }
						if(0<distanceProjJAP && distanceProjJAP < resProj && JAPvalide ){
						   indiceDistanceProjMin=1;
							resProj=distanceProjJAP;
							
						 }
						if(0<distanceProjHAV && distanceProjHAV < resProj && HAVvalide){
						   indiceDistanceProjMin=2;
							resProj=distanceProjHAV;
							
						 }
						if(0<distanceProjHAP && distanceProjHAP< resProj && HAPvalide){
						   indiceDistanceProjMin=3;
							resProj=distanceProjHAP;
							
						 }
					
					if(projection==1){
						
						distanceBoucle= Math.sqrt(Math.pow(coordProj[indiceDistanceProjMin*2],2)+Math.pow(coordProj[indiceDistanceProjMin*2+1],2));
						if(distanceBoucle<res){
				   			res=distanceBoucle;
						}
				 	}
					
				}
			}
			//console.log("distance proj : "+noms[i]+" : "+distanceBoucle+"distance point : "+(Math.sqrt(ABCDt[i*2]*ABCDt[i*2]+ABCDt[i*2+1]*ABCDt[i*2+1])));
		}
		
		//si le point le plus proche est en dehors du champs du capteur on met le res à -1
		if(porteeUltra<res){
			res=-1;
		}
	
	
	}else{
		//objet hors sujet
		nombreProjections=4;
	}
	
	if(ecartCentre<res){
		//on soustrait l'écart entre le capteur et le centre
		res-=ecartCentre;
	}else if(0<res){
			 res=0;
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
	rapport=widthCanvas=document.getElementById("simulation").clientWidth/1920;
    offsetX=BB.left;
    offsetY=BB.top;  
	
}



function rotationObjet(){
	angle=10*Math.PI/180;
	if(0<selectedObjectIndex){
		objet=objects[selectedObjectIndex];
		
		coordonneesObjet=[objet.Ax,objet.Ay,objet.Bx,objet.By,objet.Cx,objet.Cy,objet.Dx,objet.Dy];
		console.log(coordonneesObjet);
		nouveauPoint=[0,0];
		xCentre=0;
		yCentre=0;
		
		
		//calcul centre gravité
		for(var i=0;i<4;i++){
			xCentre+=coordonneesObjet[i*2];
			yCentre+=coordonneesObjet[i*2+1];
		}
		xCentre=xCentre/4;
		yCentre=yCentre/4;
		
		for(var i=0;i<4;i++){
			//pour chaque point on recalcul ses coordonnées après rotation par rapport au  (calcul du centre gravité)
			nouveauPoint[0]=coordonneesObjet[2*i]-xCentre;
			nouveauPoint[1]=coordonneesObjet[2*i+1]-yCentre;
			nouveauPoint=rotationPoint(nouveauPoint,0.1);
			coordonneesObjet[2*i]=nouveauPoint[0]+xCentre;
			coordonneesObjet[2*i+1]=nouveauPoint[1]+yCentre;
		}
		console.log(coordonneesObjet);
		objet.Ax=coordonneesObjet[0];
		objet.Ay=coordonneesObjet[1];
		objet.Bx=coordonneesObjet[2];
		objet.By=coordonneesObjet[3];
		objet.Cx=coordonneesObjet[4];
		objet.Cy=coordonneesObjet[5];
		objet.Dx=coordonneesObjet[6];
		objet.Dy=coordonneesObjet[7];
		objects[selectedObjectIndex]=objet;
	}
	changement=1;
	simule();
}

function rotationPoint(point, angle){
	res=[0,0];
	res[0]=point[0]*Math.cos(angle)-point[1]*Math.sin(angle);
	res[1]=point[0]*Math.sin(angle)+point[1]*Math.cos(angle);	
	return res;
}


function isMouseInObject(x,y,object){
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    vs=[object.Ax,object.Ay,object.Bx,object.By,object.Cx,object.Cy,object.Dx,object.Dy];
	x=x/rapport;
	y=y/rapport;
    var inside = false;
    for (var i = 0, j = vs.length/2 - 1; i < vs.length/2; j = i++) {
        var xi = vs[i*2], yi = vs[i*2+1];
        var xj = vs[j*2], yj = vs[j*2+1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) {inside = !inside;}
    }
    
    return inside;
};

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
    selectedObject.Ax+=dx/rapport;
    selectedObject.Ay+=dy/rapport;
	 selectedObject.Bx+=dx/rapport;
    selectedObject.By+=dy/rapport;
	 selectedObject.Cx+=dx/rapport;
    selectedObject.Cy+=dy/rapport;
	 selectedObject.Dx+=dx/rapport;
    selectedObject.Dy+=dy/rapport;
    // clear the canvas and redraw all shapes
	changement=1;
	dessine();
    // update the starting drag position (== the current mouse position)
    startX=mouseX;
    startY=mouseY;
	
		document.getElementById("nomSelection").innerHTML=selectedObject.nom;
}

// clear the canvas and 
// redraw all shapes in their current positions
function drawAllobjects(){
  	
	if(objects[0].image){
            // it's an image
            ctx.drawImage(objects[0].image,objects[0].Ax,objects[0].Ay);
       }
	
    for(var i=1;i<objects.length;i++){
        var object=objects[i];
        if(object.image){
            // it's an image
				ctx.globalAlpha =1;
			 	ctx.fillStyle="red"; 
            	ctx.beginPath();
   				ctx.moveTo(object.Ax, object.Ay);
				ctx.lineTo(object.Bx, object.By);
				ctx.lineTo(object.Cx, object.Cy);
				ctx.lineTo(object.Dx, object.Dy);
				ctx.fill();
			
	
        }
    }
}


function drawUltrasZones(){
	 for(var i=0;i<16;i++){
		 drawUltraZone(i*22.5+11.25,"grey");
    }
}

milieuX=0;
milieuY=0;
function drawUltraZone(angle,color){
	//on recuperera la position de la table en partant du principe qu'elle est en premiere place (à améliorer) 	
	//objects.[0]
	//on calcul la position du centre de la table
	var object=objects[0];
	milieuX=object.Ax+94;
	milieuY=object.Ay+94;
	
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
    ctx.lineTo(milieuX+porteeUltra*Math.cos((angle+7.5)*Math.PI/180), milieuY+porteeUltra*Math.sin((angle+7.5)*Math.PI/180));
    ctx.lineTo(milieuX+porteeUltra*Math.cos((angle-7.5)*Math.PI/180), milieuY+porteeUltra*Math.sin((angle-7.5)*Math.PI/180));
	//puis unarc de cercle rempli 
	ctx.arc(milieuX, milieuY,porteeUltra,(angle+7.5)*Math.PI/180,(angle-7.5)*Math.PI/180,1);
	ctx.fill();
	ctx.globalAlpha =1;
	
}



function rotation(indiceObjet,angle){
	//si un objet est selectionné et que ce n'est pas la table
	if(0<indiceObjet){
		
	}
}