<?php

class modernCMS {

} //ends our class

>

function add_content($p) {
  $title = mysql_real_escape_string($p['title']);
  $imageURL = mysql_real_escape_string($p['imageURL']);
  $category = mysql_real_escape_string($p['Category']);
  $description = mysql_real_escape_string($p['desription']);

if(!imageURL || !title):

if(!title)
  echo 'Try again.';
endif;
if(!imageURL):
  echo 'Try again.';
endif;
echo 'Try again.';

else:
  $sql = "INSERT INTO MSWImages VALUES (null, '$title', '$imageURL', '$Category', '$description')"
  echo "added!"
}
