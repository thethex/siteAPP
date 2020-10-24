
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>BD</title>

    <meta charset="UTF-8">

</head>

<body>
	
	<div>
		
		<?php 
		
$servername = "10.7.183.22:3306";
$username = "admin";
$password = "azerty";
$database = "detection_visages";

// Create connection
$conn = new mysqli($servername, $username, $password,$database);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully<br>";
		
$query = 'SELECT * FROM Echanges';


$result = mysqli_query($conn, $query);

         if (mysqli_num_rows($result) > 0) {
            while($row = mysqli_fetch_assoc($result)) {
               echo "Name: " . $row["Etat"] ."<br>";
				
            }
			 
			 
         } else {
            echo "0 results";
         }
         mysqli_close($conn);
	
	?>
	</div>
</body>
</html>