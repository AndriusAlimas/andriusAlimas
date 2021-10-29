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
    // All Buttons Modals object name and title, will help to create this modal depending on name property
    // Enter object to create more buttons modals if need it with property name and title
   let myModals = [
       {
             name:'country_cities',
             title: 'Get Info About Country and Cities'
        },
        {
            name: 'wiki',
            title: 'Get From Wikipedia Info'
        },
        {
            name:'youtube',
            title: 'See Video About Country'
        }

    ];

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

        // generate all button modals
      modalButtons = generateAllModalsButton(myModals);
      }
    });
});

// ************************** FUNCTIONS ************************
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
    map = L.map('mapView',{zoomControl: false, scrollWheelZoom: false}).setView([userPositionlat,userPositionlng], 6);

   // add layer for selected country
   countryBorderLayer = L.layerGroup().addTo(map);

    // call ajax call to access token and draw a main map
    $.ajax({
        url: 'php/getApi.php',
        type: 'POST',
        success: function(result) {
            let satellite_hybrid = L.tileLayer(`https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}@2x.jpg?key=${result.accessToken}`,{
                attribution: '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
                minZoom: 3,
                maxZoom: 14,
                detectRetina: true,
                reuseTiles: true
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

// generate modal button passing modalName which modal you want generate, it will return easyButton instance
const generateModalButton = (modalName,title)=>{
    return L.easyButton({
        position: 'bottomright',
        states: [{
            stateName: `${modalName}Modal`,
            icon: `<img  src="img/${modalName}.ico" />`,
            title: title,
            onClick: function onEachFeature(f, l){
                    // get value from 
                    var isoa2 = $('#countrySelect option:selected').val();

                    // depending on modal name we call specific functions for specific modals
                    switch(modalName){
                        case 'country_cities':
                            generateCountryModal(isoa2);
                            break;
                        case 'wiki'   :
                            generateWikiModal(isoa2);
                            break; 
                        case 'youtube' :
                            generateYoutubeModal(isoa2);
                            break;    
                    }
                    
            }
        }]
    });
}

const generateAllModalsButton = (modals) =>{
    buttons= [];
    modals.forEach(function (modal) {
       buttons.push(generateModalButton(modal.name,modal.title));

    });
    return buttons;
}

// draw country borders
const drawCountryBorders = (feature_collection, iso_a2) =>{
    countryBorderLayer.clearLayers(); // clear layer to redraw new 

     // filter country borders matched selected one and get feature object
     let countryGeoJSONBorder = feature_collection['features'].filter((a) => (a.properties.iso_a2 === iso_a2));

    // add to border layer 
    L.geoJSON(countryGeoJSONBorder).addTo(countryBorderLayer);  
}

// generate country modal and show to the user
const generateCountryModal = isoa2 =>{
    $('#country_citiesModal').modal('show');
}

// generate wiki modal and show to the user
const generateWikiModal = isoa2 =>{
    // $('#wikiModal').modal('show');
}
// generate youtube modal and show to the user
const generateYoutubeModal = iso2 =>{
   // $('#youtubeModal').modal('show');
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
                 // add all modal buttons to the map
                 modalButtons.forEach(modal => modal.addTo(map));
            }
    
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
        }
    });
});