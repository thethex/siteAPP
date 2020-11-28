

<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <title>BD</title>
<style>table.minimalistBlack {
  border: 3px solid #000000;
  text-align: left;
  border-collapse: collapse;
}
table.minimalistBlack td, table.minimalistBlack th {
  border: 1px solid #000000;
  padding: 5px 4px;
}
table.minimalistBlack tbody td {
  font-size: 13px;
}
table.minimalistBlack thead {
  background: #CFCFCF;
  background: -moz-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);
  background: -webkit-linear-gradient(top, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);
  background: linear-gradient(to bottom, #dbdbdb 0%, #d3d3d3 66%, #CFCFCF 100%);
  border-bottom: 3px solid #000000;
}
table.minimalistBlack thead th {
  font-size: 15px;
  font-weight: bold;
  color: #000000;
  text-align: left;
}
table.minimalistBlack tfoot {
  font-size: 14px;
  font-weight: bold;
  color: #000000;
  border-top: 3px solid #000000;
}
table.minimalistBlack tfoot td {
  font-size: 14px;
}</style>
    <meta charset="UTF-8">
	
</head>

<body>

	<div>
		
		<?php 
		
		
		
		
	$servername = "10.7.183.22:3306";
	//$servername = "localhost";
	$username = "invite";	
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
			echo '<div style="margin-left: 50%;
    transform: translateX(-50%);"><table border="1" class="minimalistBlack">
			<thead>
			<tr>
			<th>Id</th>
			<th>Nanotime</th>
			<th>Etat</th>
			<th>Nom</th>
			<th>Distance_Euclidienne</th>
			<th>Image</th>
			</tr>
			</thead>';
            while($row = mysqli_fetch_assoc($result)) {
				echo "<tr>";
                echo "<td>" . $row["Id"] ."</td>";
				echo "<td>" . $row["Nanotime"] ."</td>";
				echo "<td>" . $row["Etat"] ."</td>";
				echo "<td>" . $row["Nom"] ."</td>";
				echo "<td>" . $row["Distance_Euclidienne"] ."</td>";
				echo "<td>";
				$c = base64_encode($row['Image']);
				echo '<div style="max-width:800px;"><img src="data:image/jpeg;base64,'.$c.'" style="display:block; max-width: 100%;"/></div>';
				echo "</td>";
				echo "</tr>";
            }
			 echo "</table></div>";
			 
         } else {
            echo "0 results";
         }
         mysqli_close($conn);
	
	?>
	</div>
	
</body>
</html>

