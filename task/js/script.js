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
    url: "php/getApi.php",
    type: 'POST',
    dataType: 'json',
    data: {
      lat: $('#weather_lat').val(),
      lng: $('#weather_lng').val(),
      radius: $('#weather_radius').val(),
      "api_name": $('#api_name').text()
    },
    success: function(result){
      if (result.status.name == "ok") {
        obj =  result['data'];
        drawResults(obj);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      $('#result').html("<p class='bg-danger text-white'>Please make sure you entered Latitude and Longitude fields, these fields are mandatory!Make sure radius catch area!</p>");
    }
  })
});

// ajax call when you type in text places input field
$("#place").change(()=>{
  $.ajax({
    url: "php/getApi.php",
    type: 'POST',
    dataType: 'json',
    data: {
      place: $('#place').val(),
      "api_name": 'locations'
    },
    success: function(result){
      if (result.status.name == "ok") {
        $('#weather_lat').val(result.data[0].referencePosition.latitude);
        $('#weather_lng').val(result.data[0].referencePosition.longitude);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      $('#result').html("<p class='bg-danger text-white'>Please make sure you entered Latitude and Longitude fields, these fields are mandatory!Make sure radius catch area!</p>");
    }
  })
});

// FUNCTIONS
const drawResults = (obj) =>{
   // erase prev
   $('#result').html('');
   
  // draw all key and values pairs in received object
  $.each(obj,(key,value)=>{
     $('#result').append("<p>"+ key + " : " + value + "</p>");
  })
}
