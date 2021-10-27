// when loading execute this function
$(window).on('load',  () =>{
    if ($('.loading-area').length) {
        $('.loading-area').delay(1000).fadeOut('slow', function () {
        $(this).hide();
        $('nav, main').css('opacity',1);
        $('select').removeAttr("disabled");
   });
  }
})

// when all html loaded execute this function
$(document).ready(()=>{

    $.ajax({
      url: "php/getApi.php",
      type: 'POST',
      dataType: 'json',
      data: {
            "api_name": "countryBorders"
          },
      success: function(result){
        result['data'].features.forEach(function (feature) {
          $("<option>",{
            value: feature.properties.iso_a2,
            text: feature.properties.name
          }).appendTo("#countrySelect");
        })
        sortCountries();
      }
    });
     navigator.geolocation.getCurrentPosition(getUserLocation);
  });

// FUNCTIONS

// Sort Countries alphabetical order
const  sortCountries = () =>{
    $("#countrySelect").append($("#countrySelect option")
        .remove().sort((a, b) => {
            let at = $(a).text(), bt = $(b).text();
            return (at > bt) ? 1 : ((at < bt) ? -1 : 0);
        })
    );
};

// get user location
const  getUserLocation = (position) =>{
    let userPositionlat = position.coords.latitude;
    let userPositionlng = position.coords.longitude;
    
    // access map position and view
    let map = L.map('mapView').setView([userPositionlat,userPositionlng], 10);
  
    // load map tile view
    let Jawg_Streets = L.tileLayer('https://{s}.tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 22,
	subdomains: 'abcd',
	accessToken: '04yVMx6BriAAM2GxEbC0LLWicl9TJ5qCrka3agfo47w2WkFC99LicZd5yBRpggu8'
}).addTo(map);
          // 
}