/*
  Mandatory Rotating Banner
*/

$(function(){ // Document ready -- wait until HTMl is loaded before loading the JS.
  /*
    1 - Listen for rotating banner controls.
    2 - Follow the control direction
    3 - If on last slide, and user clicks next, go to first.
    4 - If on first slide, and user clicks previous, go to last.
    5 - Listen for pagination clicks and direct user accordingly.
  */

let heroControl = $(".hero-control");
let heroSlidesCount = $(".hero-slide").length - 1;

heroControl.on("click", function(){
  let heroControlDirection = $(this).attr("data-slide");
  let currentHeroSlide = $(".hero-slide.active").index();
  let nextSlide;
  if(heroControlDirection === "next"){
      nextSlide = currentHeroSlide + 1;

  } else {
    nextSlide = currentHeroSlide - 1;
  }

  if(nextSlide < 0){
    nextSlide = heroSlidesCount;
  } else if (nextSlide > heroSlidesCount) {
    nextSlide = 0;
  }

  console.log(nextSlide);
  slider(currentHeroSlide, nextSlide);
});

function slider(current, next){
  $(".hero-slide").eq(current).removeClass("active");
  $(".hero-slide").eq(next).addClass("active");
  $("#herosample").find("li").eq(current).removeClass("active");
  $("#herosample").find("li").eq(next).addClass("active");

}

let pagination = $(".hero-indicators li");

pagination.on("click", function(){
  let nextPagination = $(this).index();
  let previousPagination = $(".hero-indicators li.active").index();

  if(nextPagination !== previousPagination)
  {
    slider(previousPagination, nextPagination);
  } else
  console.log("no action needed");
});

let automatic;

$(".start").on("click", function(){
  automatic = setInterval(autoRotate, 3000);
})

function autoRotate(){
  $(".hero-control.hero-control-next").trigger("click");
};

$(".stop").on("click", function(){
  clearInterval(automatic);
})


/*
todo: look at jQuery Animation / slide to make it look pretty
*/

});

// Date: 03.19.2019
//$ is activating the jquery library
$(function(){ //this is actually declaring: when the document is ready, run the following.

/*
responsive navigation
1 - listen to navbar toggler to be clicked
2 - If the navigation is closed, then open it
3 - If the navigation is open, then close it
*/

console.log("Hello world!");

const navigationToggler = $(".navbar-toggler"); //use const instead of var. this is a const varible. You could sub .navbar-toggler with any css selector.
const mainNavigation = $("#navigation");
console.log(navigationToggler);

navigationToggler.on("click", function(){

//  alert("Hello world. ");
  mainNavigation.toggleClass("open");  //toggle will either add class or remove the class, depending fi it is there or not.
}) //.on is waiting on the action to take place. this is better option then going straight to click.


// This way allows you to add CSS in multiple passes

});



/*
  FAQ component

  1 - All FAQ Descriptions must be closed
  2 - When a user clicks on the FAQ title, the description will show if closed.
  3 - ... and will close if it's already open.

*/

const faqTitle = $(".faq-title");

faqTitle.on("click", function(){
console.log(this);
let faqDescription = $(this).closest(".faq-item").find(".faq-description"); //closest looks up goes to the closest element with this selector. find looks within that element
console.log(faqDescription);
  faqDescription.toggle(); //toggles between display:block, display:none;
});

const faqControl = $(".faq-control li");
let faqDescription = $(".faq-description");

faqControl.on("click", function(){
let control = $(this).attr("class");
console.log(control);

if (control === "open"){
  faqDescription.show();
} else if(control === "close"){
  faqDescription.hide();
}

})
// Date: 03.19.2019
//$ is activating the jquery library
$(function(){ //this is actually declaring: when the document is ready, run the following.

/*
responsive navigation
1 - listen to navbar toggler to be clicked
2 - If the navigation is closed, then open it
3 - If the navigation is open, then close it
*/

console.log("Hello world!");

const navigationToggler = $(".navbar-toggler"); //use const instead of var. this is a const varible. You could sub .navbar-toggler with any css selector.
const mainNavigation = $("#navigation");
console.log(navigationToggler);

navigationToggler.on("click", function(){

//  alert("Hello world. ");
  mainNavigation.toggleClass("open");  //toggle will either add class or remove the class, depending fi it is there or not.
}) //.on is waiting on the action to take place. this is better option then going straight to click.


// This way allows you to add CSS in multiple passes

});



/*
  FAQ component

  1 - All FAQ Descriptions must be closed
  2 - When a user clicks on the FAQ title, the description will show if closed.
  3 - ... and will close if it's already open.

*/


/*
  Mandatory Rotating Banner
*/


// Date: 03.19.2019
//$ is activating the jquery library
$(function(){ //this is actually declaring: when the document is ready, run the following.

/*
responsive navigation
1 - listen to navbar toggler to be clicked
2 - If the navigation is closed, then open it
3 - If the navigation is open, then close it
*/

console.log("Hello world!");

const navigationToggler = $(".navbar-toggler"); //use const instead of var. this is a const varible. You could sub .navbar-toggler with any css selector.
const mainNavigation = $("#navigation");
console.log(navigationToggler);

navigationToggler.on("click", function(){

//  alert("Hello world. ");
  mainNavigation.toggleClass("open");  //toggle will either add class or remove the class, depending fi it is there or not.
}) //.on is waiting on the action to take place. this is better option then going straight to click.


// This way allows you to add CSS in multiple passes

});



/*
  FAQ component

  1 - All FAQ Descriptions must be closed
  2 - When a user clicks on the FAQ title, the description will show if closed.
  3 - ... and will close if it's already open.

*/
