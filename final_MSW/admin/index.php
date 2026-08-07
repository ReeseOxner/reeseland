
<?php
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

<?php

if($_POST['add']):
$obj->add_content.($_POST);
endif;


echo $HTMLServices;
echo $HTMLAbout;
echo $HTMLFooter;


        ?>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script src="js/app.js"></script>
</html>
