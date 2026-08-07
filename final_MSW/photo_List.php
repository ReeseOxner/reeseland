
<?php
include("dbconn.inc.php"); // database connection
include("shared.php"); // stored shared contents, such as HTML header and page title, page footer, etc. in variables

echo $HTMLHeader;

?>

  <div class="article-card-centerpiece">
    <div class="article-card">
      <div class="article-card-img"><a href="outdoor.html"><img src="images/kitchen1.jpeg" alt=""></a>
      </div>
      <div class="article-card-content">
        <h2><a href="outdoor.html">Outdoor kitchens: get your quote today</a></h2>
        <p class="article-card-blurb"><br>Get MSW Enterprises to quote you on our competitively-priced outdoor kitchen sets. We handle it all! <br />
          <br/>
         <span class="colorlink"><a href="outdoor.html">Get your quote now!</a></span></p>
        </div>
      </div>
    </div>

<hr>

<style>
  table {border-collapse: collapse;}
  table tr td, table tr th {border: 1px solid black; padding: 0.5em;}
  table tr th {background-color: #333366; color: white;}


  

</style>
</head>
<body>
  <p><strong>CTEC 4321 Exam #2 Coding Question</strong></p>
<hr>
<h1>Photo Catalog</h1>

  <p><a href="photo_category_RO.php">Back to Category List</a></p>
<hr>
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
        echo "<a href='$pageURL' target=_blank><figure class='item'><img src='$ImageURL' alt=''/>
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

<?php
echo $HTMLFooter;


        ?>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="js/app.js"></script>
</html>


<script>/* Demo purposes only */
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
