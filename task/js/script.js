$(window).on('load', function () {
    if ($('#preloader').length) {
    $('#preloader').delay(1000).fadeOut('slow', function () {
    $(this).remove();
   });
  }
})


// ajax call when pressed weather api button
$("#weather_api").click(()=>{
  alert("button clicked!");
});