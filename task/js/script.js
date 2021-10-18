$(window).on('load', function () {
    if ($('#preloader').length) {
    $('#preloader').delay(1000).fadeOut('slow', function () {
    $(this).remove();
   });
  }
})

// AJAX CALLS

// Weather Api button clicked:
$("#weather_api").click(()=>{
  $.ajax({
    url: "php/getApi.php",
    type: 'POST',
    dataType: 'json',
    data: {
      lat: $('#weather_lat').val(),
      lng: $('#weather_lng').val(),
      radius: $('#weather_radius').val(),
      "api_name": $('.api_weather').text()
    },
    success: function(result){
      if (result.status.name == "ok") {
        $('#result').html('');
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

// Time Zone Api button clicked:
$("#timezone-api").click(()=>{
  let date = $('#timezone_date').val().toString();
  $.ajax({
    url: "php/getApi.php",
    type: 'POST',
    dataType: 'json',
    data: {
      lang: $('#lang').val(),
      lat: $('#timezone_lat').val(),
      lng: $('#timezone_lng').val(),
      radius: $('#timezone_radius').val(),
      date : date,
      "api_name": $('.api_timezone').text()
    },
    success: function(result){
      if (result.status.name == "ok") {
        $('#result').html('');
        obj =  result['data'];
        drawResults(obj);
        // get date object
        date_object = obj['dates'][0];
        $.each(date_object,(key,value)=>{
          $('#result').append("<p>"+ key + " : " + value + "</p>");
       })
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      $('#result').html("<p class='bg-danger text-white'>Please make sure you entered Latitude and Longitude fields, these fields are mandatory!Make sure radius catch area!</p>");
    }
  })
});


// Wikipedia Api button clicked
$("#wikipedia_api").click(()=>{
  $.ajax({
    url: "php/getApi.php",
    type: 'POST',
    dataType: 'json',
    data: {
      // lang: $('#lang').val(),
      q: $('#wiki_place').val(),
      "api_name":'geonames'
    },
    success: function(result){
      if (result.status.name == "ok") {
        $('#result').html('');
        obj =  result['data'];
        for(let i = 0; i < obj.length; i++){
          drawResults(obj[i]);
        }
      }
    },
    error: function(jqXHR, textStatus, errorThrown) {
      // your error code
      $('#result').html("<p class='bg-danger text-white'>Please make sure you entered Latitude and Longitude fields, these fields are mandatory!Make sure radius catch area!</p>");
    }
  })
});

// Weather API place text field change:
$("#weather_place").change(()=>{
  $.ajax({
    url: "php/getApi.php",
    type: 'POST',
    dataType: 'json',
    data: {
      place: $('#weather_place').val(),
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

// Time API place text field change:
$("#timezone_place").change(()=>{
  $.ajax({
    url: "php/getApi.php",
    type: 'POST',
    dataType: 'json',
    data: {
      place: $('#timezone_place').val(),
      "api_name": 'locations'
    },
    success: function(result){
      if (result.status.name == "ok") {
        $('#timezone_lat').val(result.data[0].referencePosition.latitude);
        $('#timezone_lng').val(result.data[0].referencePosition.longitude);
        $('#lang').prop("disabled", false);
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
  // draw all key and values pairs in received object
  $.each(obj,(key,value,i)=>{
     if(key ==='thumbnailImg'){
      $('#result').append(`<img id="img" width="200px" src=""/>`);
      $('#img').attr('src',value);
      let img = "img" + i;
      $('#img').attr('id', img);
     }else{
      $('#result').append("<p>"+ key + " : " + value + "</p>");
     }
  })
}
