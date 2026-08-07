<?php
// acquire shared info from other files
include("dbconn.inc.php"); // database connection
//include("shared.php"); // stored shared contents, such as HTML header and page title, page footer, etc. in variables

// make database connection
$conn = dbConnect();

?>
<?php
?>
<html>
<body>
 <hr>
<h1>Photo Catalog</h1>

<p>Please select a category from the list below to view photos.</p>

<?php

	$sql = "SELECT * FROM MSWproductType order by CatName ASC";

	/* create a prepared statement */
	$stmt = $conn->stmt_init();

	if ($stmt->prepare($sql)) {

		/* execute statement */
		$stmt->execute();

		/* bind result variables */
		$stmt->bind_result($CID, $CatName);

		print ("<ul>");
		/* fetch values */
		while ($stmt->fetch()) {
			print ("<li><a href='photo_list_RO.php?CID=$CID'>$CatName</a></li>\n");
		}

print ("</ul>");
		/* close statement */
		$stmt->close();

	} else {
		print ("query failed 3");
	}

/* close connection */
$conn->close();


?>

<hr>

<?php
echo $HTMLServices;
echo $HTMLAbout;
echo $HTMLFooter;


        ?>

</body>
</html>
