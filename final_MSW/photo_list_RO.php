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
	<style>
		table {border-collapse: collapse;}
		table tr td, table tr th {border: 1px solid black; padding: 0.5em;}
		table tr th {background-color: #333366; color: white;}


		@import url(https://fonts.googleapis.com/css?family=Raleway);
		.ITEM {
		  font-family: 'Raleway', sans-serif;
		  position: relative;
		  display: inline-block;
		  overflow: hidden;
		  margin: 10px;
		  min-width: 230px;
		  max-width: 315px;
		  width: 100%;
		  color: #ffffff;
		  font-size: 16px;
		  text-align: left;
		}
		.ITEM * {
		  -webkit-box-sizing: border-box;
		  box-sizing: border-box;
		  -webkit-transition: all 0.25s ease;
		  transition: all 0.25s ease;
		}
		.ITEM:before {
		  position: absolute;
		  top: 10px;
		  bottom: 10px;
		  left: 10px;
		  right: 10px;
		  top: 100%;
		  content: '';
		  background-color: rgba(51, 51, 51, 0.9);
		  -webkit-transition: all 0.25s ease;
		  transition: all 0.25s ease;
		  -webkit-transition-delay: 0.25s;
		  transition-delay: 0.25s;
		}
		.ITEM img {
		  vertical-align: top;
		  max-width: 100%;
		  backface-visibility: hidden;
		}
		.ITEM figcaption {
		  position: absolute;
		  top: 0;
		  bottom: 0;
		  left: 0;
		  right: 0;
		  z-index: 1;
		  align-items: center;
		  display: flex;
		  flex-direction: column;
		  justify-content: center;
		}
		.ITEM h3,
		.ITEM h5 {
		  margin: 0;
		  opacity: 0;
		  letter-spacing: 1px;
		}
		.ITEM h3 {
		  -webkit-transform: translateY(-100%);
		  transform: translateY(-100%);
		  text-transform: uppercase;
		  font-weight: 400;
		  -webkit-transition-delay: 0.05s;
		  transition-delay: 0.05s;
		  margin-bottom: 5px;
		}
		.ITEM h5 {
		  font-weight: normal;
		  background-color: #ae895d;
		  padding: 3px 10px;
		  -webkit-transform: translateY(-100%);
		  transform: translateY(-100%);
		  -webkit-transition-delay: 0s;
		  transition-delay: 0s;
		}
		.ITEM a {
		  position: absolute;
		  top: 0;
		  bottom: 0;
		  left: 0;
		  right: 0;
		  z-index: 1;
		}
		.ITEM:hover:before,
		.ITEM.hover:before {
		  top: 10px;
		  -webkit-transition-delay: 0s;
		  transition-delay: 0s;
		}
		.ITEM:hover h3,
		.ITEM.hover h3,
		.ITEM:hover h5,
		.ITEM.hover h5 {
		  -webkit-transform: translateY(0);
		  transform: translateY(0);
		  opacity: 1;
		}
		.ITEM:hover h3,
		.ITEM.hover h3 {
		  -webkit-transition-delay: 0.3s;
		  transition-delay: 0.3s;
		}
		.ITEM:hover h5,
		.ITEM.hover h5 {
		  -webkit-transition-delay: 0.2s;
		  transition-delay: 0.2s;
		}

	</style>
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
		$sql = "SELECT title, category, pageURL, ImageURL FROM MSWImages WHERE CatID = ? order by title ASC";

		/* create a prepared statement */
		$stmt = $conn->stmt_init();

		if ($stmt->prepare($sql)) {

			/* bind the parameter onto the query*/
			$stmt->bind_param('i', $CatID);

			/* execute statement */
			$stmt->execute();

		    $stmt->store_result();

			/* bind result variables */
			$stmt->bind_result($title, $category, $pageURL, $ImageURL);


			if ($stmt->num_rows > 0){
				/* fetch records to compose the link list */

//                print ("$stmt->num_rows photos found in this category. ");


				while ($stmt->fetch()) {
					echo "<a href='photo_list_DETAIL_RO.php?CID=$CatID' target=_blank><figure class='item'><img src='$ImageURL' alt=''/>
					  <figcaption>
					    <h3>$title</h3>
					    <h5>$category</h5>
					  </figcaption>
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
