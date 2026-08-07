<figure class="item"><img src="$imgURL" alt=""/>
  <figcaption>
    <h3>$title</h3>
    <h5>$category</h5>
  </figcaption><a href="#"></a>
</figure>



<figure class="item"><img src="$imgURL" alt=""/>
  <figcaption>
    <h3>$title</h3>
    <h5>$category</h5>
  </figcaption><a href="#"></a>
</figure>



<figure class="item hover"><img src="$imgsrc" alt="sample119"/>
  <figcaption>
    <h3>Nigel Nigel</h3>
    <h5>Sound &amp; Vision</h5>
  </figcaption><a href="#"></a>
</figure>
<figure class="item"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/331810/sample120.jpg" alt="sample120"/>
  <figcaption>
    <h3>Caspian Bellevedere</h3>
    <h5>Accounting</h5>
  </figcaption><a href="#"></a>
</figure>
<figure class="item"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/331810/sample120.jpg" alt="sample120"/>
  <figcaption>
    <h3>Caspian Bellevedere</h3>
    <h5>Accounting</h5>
  </figcaption><a href="#"></a>
</figure>

<style>

@import url(https://fonts.googleapis.com/css?family=Raleway);
.item {
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
.item * {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
}
.item:before {
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
.item img {
  vertical-align: top;
  max-width: 100%;
  backface-visibility: hidden;
}
.item figcaption {
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
.item h3,
.item h5 {
  margin: 0;
  opacity: 0;
  letter-spacing: 1px;
}
.item h3 {
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
  text-transform: uppercase;
  font-weight: 400;
  -webkit-transition-delay: 0.05s;
  transition-delay: 0.05s;
  margin-bottom: 5px;
}
.item h5 {
  font-weight: normal;
  background-color: #ae895d;
  padding: 3px 10px;
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
  -webkit-transition-delay: 0s;
  transition-delay: 0s;
}
.item a {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}
.item:hover:before,
.item.hover:before {
  top: 10px;
  -webkit-transition-delay: 0s;
  transition-delay: 0s;
}
.item:hover h3,
.item.hover h3,
.item:hover h5,
.item.hover h5 {
  -webkit-transform: translateY(0);
  transform: translateY(0);
  opacity: 1;
}
.item:hover h3,
.item.hover h3 {
  -webkit-transition-delay: 0.3s;
  transition-delay: 0.3s;
}
.item:hover h5,
.item.hover h5 {
  -webkit-transition-delay: 0.2s;
  transition-delay: 0.2s;
}

</style>

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
