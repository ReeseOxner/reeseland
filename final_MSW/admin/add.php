<!--<ul>
  <li><a href="add-content.php">Add content</a></li>
</ul>
-->


<?php
include("shared.php"); // stored shared contents, such as HTML header and page title, page footer, etc. in variables
include("cms_class.php"); // stored shared contents, such as HTML header and page title, page footer, etc. in variables

echo $HTMLHeader;

?>



<form method="post" action="index.php"> <!-- index.php will handle everything -->

<input type="hidden" name="add" value="true">

<div>
  <label for="title">Title</label>
  <input type="text" name="title" id="title" />
</div>

<div>
  <label for="imageURL">Image URL</label>
  <input type="text" name="imageURL" id="imageURL" />
</div>

<div>
<label for="Category">Category</label>
<input type="text" name="Category" id="Category" /> <!-- make into a selection -->
</div>

<input type="submit" name="submit" value="Add Content" />
</form>


index
if($_POST['add']):
$obj->add_content.($_POST);
endif;
