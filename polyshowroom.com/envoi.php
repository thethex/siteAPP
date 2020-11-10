
<?php
	$servername = "localhost:3306";
	$database= "polyshowroom";
	$username="root";
	$password='';
			

			
	$conn = mysqli_connect($servername,$username,$password,$database);
			
			
	if(mysqli_connect_errno()){
		die("con echouée :  ". mysqli_connect_error());
	}
	
	echo "Connection";

	
	$valeur= $_POST['Valeurs'];	
		
		
	$query="UPDATE ValCapteurs SET Valeurs='".$valeur."' WHERE Id=1";
	mysqli_query($conn,$query);


				
	
	
	mysqli_close($conn);
	
?>
