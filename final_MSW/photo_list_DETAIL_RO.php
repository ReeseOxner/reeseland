<?php
// acquire shared info from other files
include("dbconn.inc.php"); // database connection
include("shared.php");
// make database connection
$conn = dbConnect();

echo $HTMLHeader;

?>
<html>
<head>

</head>
<body><center>
<?php
if (!empty($_GET['CID']) && is_numeric($_GET['CID'])){

		$CatID = intval($_GET['CID']);

		$sql = "SELECT CatName FROM MSWproductType WHERE CatID = ?";

		$stmt = $conn->stmt_init();


		if ($stmt->prepare($sql)) {

			/* bind the parameter onto the query*/
			$stmt->bind_param('i', $CatID);

			/* execute statement */
			$stmt->execute();

			/* bind result variables */
			$stmt->bind_result($CatName);

			/* fetch values */

			if ($stmt->fetch()) {

				print ("<h2>$CatName</h2>");
			} else {
				print ("No category name is retrieved. <br/>");
			}



		} else {
			print ("query failed 1 - ");
		}

		/* close statement */
		$stmt->close();

		//==r=e=e=s=e======o=x=n=e=r============================
		// Link List - Reese Oxner
		//============================================

		/* compose a query to retrieve the pokemon information for the selected type */
		$sql = "SELECT title, category, pageURL, ImageURL, description FROM MSWImages WHERE CatID = ? order by title ASC";

		/* create a prepared statement */
		$stmt = $conn->stmt_init();

		if ($stmt->prepare($sql)) {

			/* bind the parameter onto the query*/
			$stmt->bind_param('i', $CatID);

			/* execute statement */
			$stmt->execute();

		    $stmt->store_result();

			/* bind result variables */
			$stmt->bind_result($title, $category, $pageURL, $ImageURL, $description);


			if ($stmt->num_rows > 0){
				/* fetch records to compose the link list */

//                print ("$stmt->num_rows photos found in this category. ");

				while ($stmt->fetch()) {
					echo "<a href='$pageURL' target=_blank><figure class='item2'><img src='$ImageURL' alt=''/>
					    <h3>$title</h3>
					    <h5>$category</h5><br><br>
							<h5 style='font-size:14px;'>$description</h5><br><br>
							<br>

					</figure></a>";
				}

			} else {
				print ("Currently, no photos are found for this category.  Please check back at a later time.<br>");
			}

			/* close statement */
			$stmt->close();
		} else {
			print ("query failed 2");
		}



} else {

		echo "No valid Photo Category is supplied.  Plase go to the <a href='photo_category_RO.php'> type list page</a> and select from the list of types.";
}
		$conn->close();

?>
</center>

<hr>

<?php
echo $HTMLServices;
echo $HTMLAbout;
echo $HTMLFooter;


        ?>
</body>
</html>

<script>/* javascript, from codepen */
var snippet = [].slice.call(document.querySelectorAll('.hover'));
if (snippet.length) {
  snippet.forEach(function (snippet) {
    snippet.addEventListener('mouseout', function (event) {
      if (event.target.parentNode.tagName === 'figure') {
        event.target.parentNode.classList.remove('hover')
      } else {
        event.target.parentNode.classList.remove('hover')
      }
    });
  });
}</script>
