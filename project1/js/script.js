// when loading execute this function
$(window).on('load',  () =>{
    if ($('.loading-area').length) {
        $('.loading-area').delay(1000).fadeOut('slow', function () {
        $(this).hide();
        $('nav, main').css('opacity',1);
        $('select').removeAttr("disabled");
        navigator.geolocation.getCurrentPosition(setMap);

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

// set map using user locations
const  setMap = (position) =>{
    let userPositionlat = position.coords.latitude;
    let userPositionlng = position.coords.longitude;

    // access map position and view
    map = L.map('mapView').setView([userPositionlat,userPositionlng], 6);

   // add layer for selected country
   countryBorderLayer = L.layerGroup().addTo(map);

    // call ajax call to access token and draw a main map
    $.ajax({
        url: 'php/getApi.php',
        type: 'POST',
        success: function(result) {
            // load map tile view
                let Jawg_Streets = L.tileLayer(`https://{s}.tile.jawg.io/jawg-streets/{z}/{x}/{y}{r}.png?access-token=${result.accessToken}`, {
                    attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    minZoom: 0,
                    maxZoom: 22,
            }).addTo(map);

        }
      })

    // call another ajax call to api_name countries using user location and select that location
    $.ajax({
        url: 'php/getApi.php',
        type: 'POST',
        dataType: 'json',
        data: {
           q : userPositionlat + ","+ userPositionlng,
          "api_name": "countries"
        },
        success: function(result) {
            const isoa2 = result['results'].results[0].components['ISO_3166-1_alpha-2'];
            $('#countrySelect option[value=' +isoa2+']').prop("selected", true).change();
        },
        error: function(jqXHR, textStatus, errorThrown) {
          console.log(jqXHR);
      }
      })
}

const drawCountryBorders = (feature_collection, iso_a2) =>{
    countryBorderLayer.clearLayers(); // clear layer to redraw new 

     // filter country borders matched selected one and get feature object
     let countryGeoJSONBorder = feature_collection['features'].filter((a) => (a.properties.iso_a2 === iso_a2));

    // add to border layer 
    L.geoJSON(countryGeoJSONBorder).addTo(countryBorderLayer);
}

// Event trigger select change
$('#countrySelect').change(function() {
    let iso_a2 = $('#countrySelect option:selected').val();
    
    $.ajax({
        url: "php/getApi.php",
        type: 'POST',
        dataType: 'json',
        data: {
            "api_name": "countryBorders",
            iso: iso_a2
        },
        success: function(result) {

            if (result.status.name == "ok") {
                 drawCountryBorders(result['data'],iso_a2);
            }
    
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    });
});