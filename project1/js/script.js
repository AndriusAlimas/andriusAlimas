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
        },
        {
            name:'calendar',
            title: 'Get Country Holidays & Day Off'
        },
        {
            name: 'weather_forecast',
            title: 'Get Weather Forecast'
        },
        {
            name: 'language',
            title: 'Get Words For This Country Language'
        },
        {
            name: 'covid',
            title: 'Get Covid Information'
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
            L.tileLayer(`https://{s}.tile.jawg.io/jawg-sunny/{z}/{x}/{y}{r}.png?access-token=${result.accessToken}`,{
                attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                minZoom: 3,
                maxZoom: 14,
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
                        case 'calendar' :
                            generateCalendarModal(isoa2);
                            break;    
                        case 'weather_forecast' :
                            generateWeatherModal(isoa2);
                            break;    
                        case 'language' :
                            generateLanguageModal(isoa2);
                            break;    
                        case 'covid' :
                            generateCovidModal(isoa2);
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

    // call ajax call
    $.ajax({
        url: "php/getApi.php",
        dataType: 'json',
        data: {
              "api_name": "countries_details",
              "isoa2" : isoa2
            },
        success: function(result){
            // erase fields
            $(".languages").html("");
            $(".topbigcities").html("");
            $(".topsmallcities").html("");            

            // initialize required variables for fields 
            let flagSrc = result['data'].flag.file;
            let population = result['data'].population;
            let countryName = result['data'].name;
            let area_size = result['data'].area_size;
            let currency = result['data'].currency.name;
            let capital = result['data'].capital.name;
            let phone_code = result['data'].phone_code;
            let total_cities = result['data'].total_cities;
            let languages = result['data'].languages; // this one is object

            // use variables to change data
            $("#flag").attr("src",flagSrc);
            $(".countryName").text(countryName);
            $(".population").text(population);
            $(".area").text(area_size);
            $(".currency").text(currency);
            $(".capital").text(capital);
            $(".phone_code").text("+"+phone_code);
            $(".total_cities").text(total_cities);

           for(language in languages){
            $(".languages").append(" " + "<mark>" + languages[language] + "</mark>");
           }
           
           // another ajax call for top biggest cities
            $.ajax({
                url: "php/getApi.php",
                dataType: 'json',
                data: {
                    "api_name": "countries_cities",
                    "isoa2" : isoa2,
                    "population" : 1000000
                    },
                    success: function(result){
                        populateTableCities(result['data'].cities,true);     
            // another ajax call for small cities cities
            $.ajax({
                url: "php/getApi.php",
                dataType: 'json',
                data: {
                    "api_name": "countries_cities",
                    "isoa2" : isoa2,
                    "population" : 20000
                    },   
                    success: function(result){
                        populateTableCities(result['data'].cities,false);
                    }  
                    });
          }
        }); // end inner ajax call
   
        } // end outer ajax success call   
      }); // end outer ajax call

    // show the modal  
    $('#country_citiesModal').modal('show');
}

// populate table cities, depending on cities population
const populateTableCities = (cities,isBig) =>{
    className = ".topsmallcities";
     // check if we have cities and sort by population, highest population goes first
     if(cities != null){
        cities.sort(function (a, b) {
            return b.population - a.population;
        });
    }

    let id = 0;
    let population = 0;
    let name = ""

    
        if(isBig){
           className = ".topbigcities";
        }
       
    for(city in cities){
        id++;
        population = cities[city].population;
        name = cities[city].name;
        $(`${className}`).append("<tr><th scope='row'>"+ id + "</th><td>" + name + "</td><td>" + population + "</td></tr>");
    }    
} 

// generate wiki modal and show to the user
const generateWikiModal = isoa2 =>{
     $('#wikiModal').modal('show');
}

// generate youtube modal and show to the user
const generateYoutubeModal = iso2 =>{
   $('#youtubeModal').modal('show');
}

// generate calendar modal and show to the user
const generateCalendarModal = iso2 =>{
     $('#calendarModal').modal('show');
}

// generate weather modal and show to the user
const generateWeatherModal = iso2 =>{
     $('#weather_forecastModal').modal('show');
}

// generate language modal and show to the user
const generateLanguageModal = iso2 =>{
    $('#languageModal').modal('show');
}

// generate covid modal and show to the user
const generateCovidModal = iso2 =>{
     $('#covidModal').modal('show');
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