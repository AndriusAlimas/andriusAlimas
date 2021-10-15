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
      // console.log(JSON.stringify(result));
      if (result.status.name == "ok") {
       $('#result').html("<table class='table table-bordered table-info'><caption>Results</caption>"+
                            "<thead class='text-success'>" +
                              "<tr>" +
                                "<th>Date Time</th>" + 
                                "<th>Station Name</th>" + 
                                "<th>Country Code</th>" + 
                                "<th>Temperature</th>" + 
                                "<th>Clouds</th>" + 
                                "<th>Wind Direction</th>" + 
                                "<th>Wind Speed</th>" + 
                                "<th>Humidity</th>" + 
                                "<th>Weather Condition</th>" + 
                                "</tr>" + 
                            "</thead>" +
                            "<tbody>" +
                                "<tr>" +
                                  "<td>"+result['data']['datetime'] +"</td>"+
                                  "<td>"+result['data']['stationName'] +"</td>"+
                                  "<td>"+result['data']['countryCode'] +"</td>"+
                                  "<td>"+result['data']['temperature'] +"</td>"+
                                  "<td>"+result['data']['clouds'] +"</td>"+
                                  "<td>"+result['data']['windDirection'] +"</td>"+
                                  "<td>"+result['data']['windSpeed'] +"</td>"+
                                  "<td>"+result['data']['humidity'] +"</td>"+
                                  "<td>"+result['data']['weatherCondition'] +"</td>"+
                                "</tr>"+
                            "</tbody>"+
                          "</table>"
       );
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
    url: "php/getPosition.php",
    type: 'POST',
    dataType: 'json',
    data: {
      place: $('#place').val()
    },
    success: function(result){
      // for testing only to see result in console
      // console.log(JSON.stringify(result));
      if (result.status.name == "ok") {
         console.log(result.data[0].referencePosition);
        $('#lat').val(result.data[0].referencePosition.latitude);
        $('#lng').val(result.data[0].referencePosition.longitude);
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      $('#result').html("<p class='bg-danger text-white'>Please make sure you entered Latitude and Longitude fields, these fields are mandatory!Make sure radius catch area!</p>");
    }
  })
});
