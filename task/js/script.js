$(window).on('load', function () {
    if ($('#preloader').length) {
    $('#preloader').delay(1000).fadeOut('slow', function () {
    $(this).remove();
   });
  }
})

// ajax call when pressed weather api button
$("#weather_api").click(()=>{
  $.ajax({
    url: "php/getWeatherObservation.php",
    type: 'POST',
    dataType: 'json',
    success: function(result){
      // for testing only to see result in console
      console.log(JSON.stringify(result));

      if (result.status.name == "ok") {
        $("#result").html("<h1>Yes</h1>");
      }
    },

    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      console.log("No");
    }
  })
});
