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
    data: {
      lat: $('#lat').val(),
      lng: $('#lng').val(),
      radius: $('#radius').val()
    },
    success: function(result){
      // for testing only to see result in console
      console.log(JSON.stringify(result));
      console.log(result['data']['countryCode']);
      if (result.status.name == "ok") {
       $('#result').html("<h1>" + result['data']['countryCode']+"</h1>");
      }
    },

    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      $('#result').html("<p class='bg-danger text-white'>Please make sure you entered Latitude and Longitude fields, these fields are mandatory!</p>");
    }
  })
});
