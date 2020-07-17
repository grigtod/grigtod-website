var slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("gallery-Slides");
    var captionText = document.getElementById("caption");
    var numberText = document.getElementById("gallery-numbertext");
    var galleryElements = document.getElementsByClassName("gallery-element");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex-1].style.display = "block";
    if(captionText != null)
        captionText.innerHTML = galleryElements[slideIndex-1].alt;
    if(numberText != null)
        numberText.innerHTML = slideIndex + " / " + slides.length;
}
