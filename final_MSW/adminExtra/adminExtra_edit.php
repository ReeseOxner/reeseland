<?php
// acquire shared info from other files
include("dbconn.inc.php"); // database connection
include("shared.php"); // stored shared contents, such as HTML header and page title, page footer, etc. in variables
include("access.php");

// make database connection
$conn = dbConnect();

// Process only if there is any submission
if (isset($_POST['Submit'])) {

	// ==========================
	//vaIIDate user input

	// set up the required array
	$required = array("title", "ImageURL", "CatID", "category", "pageURL"); // note that, in this array, the spelling of each item should match the form field names
	//$title, $ImageURL, $pageURL, $category, $CatID


	// set up the expected array
	$expected = array("title", "ImageURL", "CatID", "category", "pageURL", "IID"); // again, the spelling of each item should match the form field names

    // set up a label array, use the field name as the key and label as the value
    $label = array ('title'=>'title', "ImageURL"=>'ImageURL', "CatID"=>'CatID', "category"=>'category', "pageURL"=>'pageURL', "IID"=>'Link ID');


	$missing = array();

	foreach ($expected as $field){
		// isset($_POST[$field]):  Note that if there is no user selection for radio buttons, checkboxes, selection list, then $_POST[$field] will not be set

		// Under what conditions the script needs to record a field as missing -- $field is required and one of the following two (1)  $_POST[$field] is not set or (2) $_POST[$field] is empty

		//echo "$field: in_array(): ".in_array($field, $required)." empty(_POST[$field]): ".empty($_POST[$field])."<br>"; // for debugging purposes

		if (in_array($field, $required) && (!isset($_POST[$field]) || empty($_POST[$field]))) {
			array_push ($missing, $field);

		} else {
			// Passed the required field test, set up a variable to carry the user input.
			// Note the variable set up here uses the $field value as the veriable name. Notice the syntax ${$field}.  This is a "variable variable". For example, the first $field in the foreach loop here is "title" (the first one in the $expected array) and a $title variable will be created.  The value of this variable will be either "" or $_POST["title"] depending on whether $_POST["title"] is set up.
            // once we run through the whole $expected array, then these variables, "$title", "$URL", "$CID", and "$IID" will be generated.

			if (!isset($_POST[$field])) {
				//$_POST[$field] is not set, set the value as ""
				${$field} = "";
			} else {

				${$field} = $_POST[$field];

			}

		}

	}

print_r ($missing); // for debugging purpose

	/* add more data vaIIDation here */
	// ex. $price should be a number

	/* proceed only if there is no required fields missing and all other data vaIIDation rules are satisfied */
	if (empty($missing)){

		//========================
		// processing user input

		$stmt = $conn->stmt_init();


		// compose a query: Insert or Update? Depending on whether there is a $IID.

		if ($IID != "") {
			/* there is an existing IID ==> need to deal with an existing reocrd ==> use an update query */
//print "an existing IID";
print $IID;
			// Ensure $IID contains an integer.
			$IID = intval($IID);

			$sql = "Update MSWImages SET title = ?, ImageURL = ?, CatID = ?, category = ?, pageURL = ? WHERE IID = ?";

			if($stmt->prepare($sql)){

				// Note: user input could be an array, the code to deal with array values should be added before the bind_param statment.
				$stmt->bind_param('ssissi',$title, $ImageURL, $CatID, $category, $pageURL, $IID);
				$stmt_prepared = 1;// set up a variable to signal that the query statement is successfully prepared.
			}

		} else {
			// no existing IID ==> this means no existing record to deal with, then it must be a new record ==> use an insert query
			$sql = "Insert Into MSWImages (title, ImageURL, CatID, category, pageURL) values (?, ?, ?, ?, ?)";
			print "no existing IID";

			if($stmt->prepare($sql)){

				// Note: user input could be an array, the code to deal with array values should be added before the bind_param statment.

				$stmt->bind_param('ssiss',$title, $ImageURL, $CatID, $category, $pageURL);
				$stmt_prepared = 1; // set up a variable to signal that the query statement is successfully prepared.
			}
		}

		if ($stmt_prepared == 1){
			if ($stmt->execute()){
				$output = "<span class='success'>Success!</span><p>The following information has been saved in the database:</p>";
				foreach($expected as $key){
					$output .= "<b>{$label[$key]}</b>: {$_POST[$key]} <br>";
				}
				$output .= "<p>Back to the <a href='adminExtra_list.php'>link list page</a></p>";
			} else {
				//$stmt->execute() failed.
				$output = "<div class='error'>1 | Database operation failed.  Please contact the webmaster.</div>";
			}
		} else {
			// statement is not successfully prepared (issues with the query).
			$output = "2 | <div class='error'>Database query failed.  Please contact the webmaster.</div>";
		}

	} else {
		// $missing is not empty
		print "Missing is not empty";

		$output = "<div class='error'><p>The following required fields are missing in your form submission.  Please check your form again and fill them out.  <br>Thank you.<br>\n<ul>\n";
		foreach($missing as $m){
			$output .= "<li>{$label[$m]}\n";
		}
		$output .= "</ul></div>\n";
	}

} else {
	$output = "<div class='error'>Please begin your link managment operation from the <a href='adminExtra_list.php'>admin page</a>.</div>";
}


?>

<?php
	print $HTMLHeader;
	print $course;
?>
<header>
</header>

<?php echo $admin_nav ?>

<main class='flexboxContainer'>

    <div>
        <?= $output ?>
    </div>

</main>

<?php
print $PageFooter; ?>

</body>
</html>
