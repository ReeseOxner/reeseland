<?php
// acquire shared info from other files
include("dbconn.inc.php"); // database connection
include("shared.php"); // stored shared contents, such as HTML header and page title, page footer, etc. in variables
include("access.php");

// make database connection
$conn = dbConnect();

// This form is used for both adding or updating a record.
// When adding a new record, the form should be an empty one.  When editing an existing item, information of that item should be preloaded onto the form.  How do we know whether it is for adding or editing?  Check whether a product id is available -- the form needs to know which item to edit.

$IID = ""; // place holder for link id information.  Set it as empty initally.  You may want to change its name to something more fitting for your application.  However, please note this variable is used in several places later in the script. You need to replace it with the new name through out the script.

// Set all values for the form as empty.  To prepare for the "adding a new item" scenario.
$title = "";
$ImageURL = "";
$pageURL = "";
$category = "";
$CatID = "";
//$title, $ImageURL, $pageURL, $category, $CatID
$errMsg = "";

// check to see if a product id available via the query string
if (isset($_GET['IID'])) { // note that the spelling 'pid' is based on the query string variable name.  When linking to this form (form.php), if a query string is attached, ex. form.php?IID=3 , then that information will be detected here and used below.

	$IID = intval($_GET['IID']); // get the integer value from $_GET['IID'] (ensure $IID contains an integer before use it for the query).  If $_GET['IID'] contains a string or is empty, intval will return zero.

	// vaIIDate the link id -- $IID should be greater than zero.
	if ($IID > 0){

		//compose a select query
		$sql = "SELECT title, ImageURL, pageURL, category, CatID from MSWImages WHERE LinkID = ?";

		$stmt = $conn->stmt_init();

		if($stmt->prepare($sql)){
			$stmt->bind_param('i', $IID);
			$stmt->execute();

			$stmt->bind_result($title, $ImageURL, $pageURL, $category, $CatID); // bind the three pieces of information selected in the query ($sql).

			$stmt->store_result();

			// proceed only if a match is found -- there should be only one row returned in the result
			if($stmt->num_rows == 1){
				$stmt->fetch();
			} else {
				$errMsg = "<div class='error'>Information on the record you requested is not available.  If it is an error, please contact the webmaster.  Thank you.</div>";
				$IID = ""; // reset $IID
			}

		} else {
			// reset $IID
			$IID = "";
			// compose an error message
			$errMsg = "<div class='error'> If you are expecting to edit an exiting item, there are some error occured in the process -- the selected product is not recognizable.  Please follow the link below to the product adminstration interface or contact the webmaster.  Thank you.</div>";
		}

		$stmt->close();
	} // close if(is_int($IID))

}

// function to create the options for the category drop-down list.
//  -- the value of parameter $selectedCID comes from the function call
function CategoryOptionList($selectedCID){

	$list = ""; //placeholder for the link category option list

	global $conn;
	// retrieve category info from the database to compose a drop down list
	$sql = "SELECT CatID, CatName FROM MSWproductType order by CatName";

	$stmt = $conn->stmt_init();

	if ($stmt->prepare($sql)){

		$stmt->execute();
		$stmt->bind_result($CatID, $CatName);

		while ($stmt->fetch()) {
			// while going through the rows in the results, check if the category id of the current row matches the parameter ($CatID) provided by the function call
			if ($CatID == $selectedCID){
				$selected = "Selected";
			} else {
				$selected = "";
			}
			// create an option based on the current row
			$list = $list."<option value='$CatID' $selected>$CatName</option>";
		}
	}
	$stmt->close();
	return $list;
}


if (array_key_exists('upload', $_POST)) {
  // define constant for upload folder
  define('UPLOAD_DIR', '/home/reeseuta/ctec4309.reese.uta.cloud/file_upload/storage/');

  // move the file to the upload folder and rename it
  if (move_uploaded_file($_FILES['image']['tmp_name'], UPLOAD_DIR.$_FILES['image']['name'])){
      // upload successful
      $message = "The selected file has been successfully uploaded.<br><a href='storage/{$_FILES['image']['name']}'>See your uploaded file.</a>";
  } else {
      // something is wrong
      $message = "We have encountered issues in uploading this file.  Please try again later or contact the web master. ";
  }
}
?>
<?php
	print $HTMLHeader;
	print $course;
?>
<header>
	<h1><?= $SubTitle_Admin ?></h1>
</header>

<?php echo $admin_nav ?>

<main class='flexboxContainer'>

<div>

<h2>Link Information Form</h2>

    <p><?= $errMsg ?></p>

<form action="adminExtra_edit.php" method="POST">
* Required
	<!-- pass the pid information using a hidden field -->
	<input type="hidden" name="IID" value="<?=$IID?>">

	<table class='formTable'>
		<tr><th>Title*:</th><td><input type="text" name="title" size="45" value="<?= $title ?>"></td></tr>
		<tr><th>ImageURL*:</th><td><input type="text" name="ImageURL" size="45" value="<?= $ImageURL ?>"></td></tr>
		<tr><th>CatID*:</th><td><select name="CatID"><?= CategoryOptionList($CatID)?></select></td></tr>
		<tr><th>Category*:</th><td><input type="text" name="category" size="45" value="<?= $category ?>"></td></tr>
		<tr><th>PageURL*:</th><td><input type="text" name="pageURL" size="45" value="<?= $pageURL ?>"></td></tr>

		<tr><td colspan=2><input type=submit name="Submit" value="Submit Link Information"></td></tr>
	</table>

</form>
</div>
</main>

<?php print $PageFooter; ?>

</body>
</html>
