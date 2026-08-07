<?php
// store shared information in this file, such as headers, menu, and footers

//HTML Header
$HTMLHeader =
"<html>
<head>
  <meta charset='utf-8'>
  <meta name='description' content='Description goes here'>
  <meta name='keywords' content='HTML, CSS, XML, Javascript'>
  <meta name='author' content='Reese Oxner'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>

  <title> Azle, Texas | MSW Enterprises </title>

  <link rel='stylesheet' type='text/css' href='css/style.css'>
</head>
<main>

  <header> <button class='navbar-toggler' type='button' data-target='#navigation'><i class='fa fa-bars'></i></button> <nav class='navbar'>
  </div></nav>
</header>
<body><div class='container'>

  <div class='logo'> <a href='index.html'><img src='images/logo.png' id='logo'  alt='MSW Enterprises logo' style='width:400px;'></a>
  </div>

  <div class='tagline'>UTA's news source since 1919</div>
  <ul class='secondary-navigation'>
    <li><a href='index.php'>Home</a></li>
    <li><a href='about.html'>About</a></li>
    <li><a href='contact.html'>Contact</a></li>
    <li><a href='photo_list_RO.php?CID=4'>Outdoor Kitchens</a></li>
    <li><a href='photo_list_RO.php?CID=1'>Masonry</a></li>
    <li><a href='photo_list_RO.php?CID=3'>Construction</a></li>
    <li><a href='photo_list_RO.php?CID=2'>Concrete</a></li>

  </ul>
";


$HTMLFooter =
"
</main>
</body>

<footer>
<div class='article-list'>
	<div class='article-list-container'>
		<div class='article-list-element'>
			<img src='images/logo.png' class='smalllogo'>
			<p>© 2019 <em>MSW Enterprises</em> This website was created for a class project and is for educational purposes only</p>
			<ul>

			</ul>
		</div>

		<div class='article-list-element'>
			<h5>GENERAL</h5>
			<ul>
				<li><a href='adminExtra_list.php'>Admin</a></li>
				<li><a href='contact.html'>Contact</a></li>
				<li><a href='jobs.html'>Jobs</a></li>
			</ul>
		</div>

		<div class='article-list-element'>
			<h5>SERVICES</h5>
			<ul>
				<li><a href='masonry.html'>Masonry</a></li>
				<li><a href='construction.html'>Construction</a></li>
				<li><a href='Plumbing.html'>Plumbing</a></li>
				<li><a href='Outdoor.html'>Outdoor spaces</a></li>
				<li><a href='otherconstruction.html'>Other</a></li>
			</ul>
		</div>


		<div class='article-list-element'>
			<h5>SOCIAL MEDIA</h5>
			<ul>
				<li><a href='samplearticle.html'><i class='fab fa-facebook-f'></i></i> Facebook</a></li>
				<li><a href='samplearticle.html'><i class='fab fa-twitter'></i> Twitter</a></li>
				<li><a href='samplearticle.html'><i class='fab fa-instagram'></i> Instagram</a></li>
				<li><a href='samplearticle.html'><i class='fab fa-linkedin'></i> Linkedin</a></li>

			</ul>
		</div>
	</div>
</div>
</footer>";


//Page Footer
$PageFooter = "
<footer>
<p><em>This website was created for a UT Arlington course and is for educational use only.</em></p>
</footer>
";


//SERVICES OFFERED

$ServicesOffered = "<div style='width:50% MARGIN: 0, auto;'>

Services offered:
       <ul>
         <li><a href='#'>Masonry</a></li>
         <li><a href='#'>Construction</a></li>
         <li><a href='#'>Plumbing</a></li>
         <li><a href='#'>Outdoor spaces</a></li>
         <li><a href='#'>Plumbing</a></li>
    </ul>
</div>
		";


		$HTMLAbout = "<div class='action-box'>
		  <div class='action-box-container'>
		    <div class='action-box-img'></div>
		    <div class='action-box-content'>
		      <h3 class='action-box-headline'>About MSW Enterprises</h3> <br>
		      <div class='action-box-blurb'>At MSW Enterprises, our company is based on the belief that our customers' needs are of the utmost importance. Our team is committed to meeting those needs. We welcome the opportunity to earn your trust and deliver you the best service. No job is too big for our experienced team. Call today for a quote. My criteria of work doesn't include small projects that are considered handyman work.
		<br>


		        <div class='action-box-button' style='text-align: right;'><button><a href='requestinfo.html'>Request info now!</button></a></div>
		      </div>
		    </div>
		  </div>
		</div>";

		$HTMLServices = "
		<div class='action-box'>
	    <div class='action-box-container'>
	      <div class='action-box-content'>
	 <div class='article-card-content'>
	            <h2>Services offered:</h2>
	            <p class='article-card-blurb'> We are experts in almost all kinds of construction but specialize in several areas.
	 <p> MSW Enterprises offers the following: </p><p> <br>
	              <ul STYLE='PADDING-LEFT:20PX;'>
	                <li><a href='masonry.html'>Masonry</a></li>
	                <li><a href='construction.html'>Construction</a></li>
	                <li><a href='Plumbing.html'>Plumbing</a></li>
	                <li><a href='Outdoor.html'>Outdoor spaces</a></li>
	                <li><a href='otherconstruction.html'>Other</a></li>
	              </ul></p>
	 <br />



	 </div></div></div></div>";


   // Header
   $header = "
   <header class='headerExEd'>
       <h1>$SubTitle_Admin</h1>
   </header>\n";

   // Admin Nav
   $admin_nav = "<nav class='flexboxContainer'><div>
                   <div class='buttonBox'><a href='adminExtra_form.php'><span class='button'>+</span> Add a new item</a></div>
                   <div class='buttonBox'><a href='adminExtra_list.php'><span class='button'> ./ </span> List all items</a></div>
                 </div></nav>
                   ";

   /*========================================*/



		?>
