// when loading execute this function
$(window).on('load',  () =>{
    if ($('.loading-area').length) {
        $('.loading-area').delay(1000).fadeOut('slow', function () {
        $(this).hide();
        $('nav, main').css('opacity',1);
        $('select').removeAttr("disabled");
        var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
if (isIOS) {
 alert("HEY!!");
} else {
  console.log('This is Not a IOS device');
}
        let location = navigator.geolocation.getCurrentPosition(setMap)
        if (location == undefined)  {
            console.log("Locations is disabled");
            setMap(location);
        }
   });
  }
})
 
// when all html loaded execute this function
$(document).ready(()=>{
    countryName = "";
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
        sortCountries(); // sort countries   
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
    let userPositionlat,userPositionlng;
    if(position == undefined){
        console.log("Disabled Location");
        userPositionlat = 53.6969216
        userPositionlng = -1.4974976
    }else{
        userPositionlat = position.coords.latitude;
        userPositionlng = position.coords.longitude;
        console.log(userPositionlat);
        console.log(userPositionlng);
    }
 
    // access map position and view
    map = L.map('mapView',{zoomControl: false, scrollWheelZoom: true}).setView([userPositionlat,userPositionlng], 3);

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
            countryName = $('#countrySelect option:selected').text();
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
                    isoa2 = $('#countrySelect option:selected').val();
                    countryName = $('#countrySelect option:selected').text();
                    countryName = encodeURIComponent(countryName); // encode 
                    // depending on modal name we call specific functions for specific modals
                    switch(modalName){
                        case 'country_cities':
                            generateCountryModal(isoa2);
                            break;
                        case 'wiki'   :
                            generateWikiModal(countryName);
                            break; 
                        case 'youtube' :
                            generateYoutubeModal(countryName);
                            break;    
                        case 'calendar' :
                            generateCalendarModal(isoa2,countryName);
                            break;    
                        case 'weather_forecast' :
                            generateWeatherModal(countryName);
                            break;      
                        case 'covid' :
                            generateCovidModal(countryName);
                            break;   
                    }
            }
        }]
    });
}

// generate all modals buttons 
const generateAllModalsButton = modals =>{
    let buttons= [];
    modals.forEach(function (modal) {
       buttons.push(generateModalButton(modal.name,modal.title));
    });
    return buttons;
}

// draw country borders polygons
const drawCountryBorders = (feature_collection, iso_a2) =>{
    countryBorderLayer.clearLayers(); // clear layer to redraw new 

     // filter country borders matched selected one and get feature object
     let countryGeoJSONBorder = feature_collection['features'].filter((a) => (a.properties.iso_a2 === iso_a2));

    // add to border layer 
    L.geoJSON(countryGeoJSONBorder).addTo(countryBorderLayer);  
}

// populate table cities, depending on cities population
const populateTableCities = cities =>{
    let topBigCities = [];
    let topSmallCities = [];
    let topSmallCitiesLimit = [];
    let className = ".topsmallcities";

    // sorting big cities 
    for(city in cities){
        if(cities[city].population > 1000000){
        topBigCities.push(cities[city]);
      }
    }
    sortCitiesPopulation(topBigCities);

    // sorting small cities 
    for(city in cities){
        if(cities[city].population >20000 && cities[city].population < 1000000){
        topSmallCities.push(cities[city]);
      }
    }     
    sortCitiesPopulation(topSmallCities); 
    
    // limiting small cities only show 100 on the table
    for(let i = 0;i< topSmallCities.length;i++){
        topSmallCitiesLimit.push(topSmallCities[i]);
        if(i == 99){
            break;
        }
    }
    // draw tables by giving small and big cities results
    drawCitiesTable(topSmallCitiesLimit,className);

    if(topBigCities[0] != null && topBigCities[0].population > 1000000){
      className = ".topbigcities";
           drawCitiesTable(topBigCities,className);
    }
} 

// function that makes number more readable with comma every third digits
const numberWithCommas = number =>{
    return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// function that draw city table by giving result
const drawCitiesTable = (cities,className) =>{
    let id = 0;
    let population = 0;
    let name = ""
    if(cities != null){
         for(city in cities){
        id++;
        population = cities[city].population;
        name = cities[city].name;
        $(`${className}`).append("<tr><th scope='row'>"+ id + "</th><td>" + name + "</td><td>" + numberWithCommas(population) + "</td></tr>");
    }   
    }  
}

// sorting cities by population
const sortCitiesPopulation = cities =>{
    if(cities != null){
 
        cities.sort(function (a, b) {
            return b.population - a.population;
        });
    }
}

// Kelvin to Celsius convertion
const kelvinToCelsius = kelvin => kelvin-273.15;

// format time in AM or PM
const formatAMPM = date => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

// Convert Meters Per Second to Miles Per Hour
const convertMsToMph = ms => Math.round(ms * 2.236936);

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

// Event trigger select change of city in weather module
$('#citySelect').change(() =>{
    // when changing needs to refresh data
    $('.weather_result').html("");

    // get city name
    let city = $('#citySelect option:selected').val();
    
     // ajax call
     $.ajax({
        url: "php/getApi.php",
        type: 'POST',
        dataType: 'json',
        data: {
          "api_name":'open_weather_map',
          "city" : encodeURIComponent(city),
        },
        success: function(result){
            result.data.list.forEach(function(data){
                // get date info 
                let date = data.dt_txt;
                let full_date = date.substr(0,11);
                let time = formatAMPM(new Date(date));
                date = full_date + " * " + time + " * ";

                // get temparature info
                let temp =  Math.round(kelvinToCelsius(data.main.temp));
                let tempMax =  Math.round(kelvinToCelsius(data.main.temp_max));
                let tempMin =  Math.round(kelvinToCelsius(data.main.temp_min));
                let temp_min_max = tempMax + "??C / " + tempMin;
                let feels_like =  Math.round(kelvinToCelsius(data.main.feels_like));

                // get humidity
                let humidity = data.main.humidity;

                // get weather condition
                let icon = data.weather[0].icon;
                let description = data.weather[0].description;
                let weather = `<img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" title="${description}">`;

                // get wind direction
                let rotate = 35 - data.wind.deg;
                let wind_direction = `<img src="./img/wind_arrow.png" class="wind_direction" style="transform:rotate(${rotate}deg)">`;

                // get wind gust and wind speed
                let wind_gust = Math.round(data.wind.gust);
                let wind_speed = convertMsToMph(data.wind.speed);

                // populate weather results 
                $('.weather_result').append(`<tr class="align-middle">
                <td>${date}</td>
                <td>${temp} ??C</td>
                <td>${feels_like} ??C</td>
                <td>${temp_min_max} ??C</td>
                <td>${humidity} %</td>
                <td>${weather}</td>
                <td>${wind_direction}</td>
                <td>${wind_gust} m/sec</td>
                <td>${wind_speed} mph</td>
                </tr>`);
            });
        }
    });
});

// Add calendar Events in current year
const addCalendarEvents = (year,iso2,countryName) =>{
    $('.calendar-events>.event-header>p').html('');
    $('.calendar-events>.event-header>p').append("formattedDate");
    $.ajax({
        url: "php/getApi.php",
        type: 'POST',
        dataType: 'json',
        data: {
          "api_name":'holiday',
          "iso2" : iso2,
          "year" : year,
        },
        success: function(result){
            let calendarEvents = [];
            $("#calendarModalLabel").html(`Holidays in ${decodeURIComponent(countryName)}`);
            let holidays = result['data'].response.holidays;
            const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ];
           
            holidays.forEach((holiday,index) => {
                 let dayIso = holiday.date.iso;
                 let date = new Date(dayIso);
                 let month = monthNames[date.getMonth()];
                 formattedDate = month + "/" + date.getDay() + "/" + date.getFullYear();
                 let event = {
                    id: `event${index}`,
                    name: holiday.name,
                    date: formattedDate,
                    description: holiday.description,
                    type: "all",
                    everyYear:true,
                 };
                 calendarEvents.push(event);   
            }

            );      
            // setup calendar   
            $('#calendar').evoCalendar({
                theme:'Orange Coral',
                calendarEvents:calendarEvents
            })
           }
        })
}

// GENERATE XXX MODAL FUNCTIONS
// generate country modal and show to the user
const generateCountryModal = isoa2 =>{
   let cities_array =  [];
    // call ajax call
    $.ajax({
        url: "php/getApi.php",
        dataType: 'json',
        data: {
              "api_name": "countries_details",
              "isoa2" : isoa2
            },
        success: function(result){
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
            $(".population").text(numberWithCommas(population));
            $(".area").text(numberWithCommas(area_size));
            $(".currency").text(currency);
            $(".capital").text(capital);
            $(".phone_code").text("+"+phone_code);
            $(".total_cities").text(numberWithCommas(total_cities));

           for(language in languages){
            $(".languages").append(" " + "<mark>" + languages[language] + "</mark>");
           }
  
            // ajax call to get total page number for cities, because max capacity for this api is 100, we need more to get all cities
            $.ajax({
                url: "php/getApi.php",
                dataType: 'json',
                data: {
                    "api_name": "countries_cities",
                    "isoa2" : isoa2,
                    "population" : 20000
                    },   
                    success: function(result){
                        total_pages = result['data'].total_pages;
                        let cities = result['data'].cities;
                                       
                            for(city in cities){
                                cities_array.push(cities[city]); 
                                }
                        if( total_pages > 1){
                            for(page = 2;page < total_pages+1;page++ ){
                                // if its more than 100 cities means more pages we need to call more to get all cities
                                $.ajax({
                                    url: "php/getApi.php",
                                    dataType: 'json',
                                    type: 'POST',
                                    data: {
                                        "api_name": "countries_cities-morePage",
                                        "isoa2" : isoa2,
                                        "page" : page,
                                        "population" : 20000
                                    },
                                    success: function(result){
                                
                                        let cities = result['data'].cities;
                                       
                                        for(city in cities){
                                            cities_array.push(cities[city]);
                                            
                                        }
                                        // only call populateTableCities when everything is done
                                        if(total_pages * 100 - 100  < cities_array.length){
                                             populateTableCities(cities_array);
                                        }
                                    }
                                });
                            }
                        }
                        else{
                            populateTableCities(result['data'].cities);
                        }
                 }  
            });
          }
        });        
    // show the modal  
    $('#country_citiesModal').modal('show');
}

// generate wiki modal and show to the user
const generateWikiModal = countryName =>{
    $.ajax({
        url: "php/getApi.php",
        type: 'POST',
        dataType: 'json',
        data: {
        "api_name":'geonames',
        "q" : countryName,
        },
        success: function(result){
            if (result.status.name == "ok") {
                $('#wiki-modal-body').html('');
        
                wiki =  result['data'].geonames;

                $('#wiki-modal-body').append(`<div class="row wiki-result align-items-center">`);

        for(let i = 0; i < wiki.length; i++){
            let summary = ""
            let wiki_link = ""
            let thumbnailImg = "";

            summary = wiki[i].summary;
            wiki_link = wiki[i].wikipediaUrl;
            thumbnailImg = wiki[i].thumbnailImg;
            summary += ` <a href='https://${wiki_link}'> Learn More </a>`
            $('.wiki-result').append(`<div class="summary col-12 col-lg-7"> ${summary}"</div>`);

            // if we get no picture show our image - image not found
            if(typeof(thumbnailImg) != "undefined"){   
                 $('.wiki-result').append(`<img  class="thumbnailImg d-none d-sm-block d-sm-none d-md-block d-md-none d-lg-block col-lg-5" src=${thumbnailImg}></div>`);
            }
            else{
                 $('.wiki-result').append(`<img class="d-none d-sm-block d-sm-none d-md-block d-md-none d-lg-block col-lg-5" src="./img/no-image-found.png"></div>`);
            }
        } // end for loop
      }
    }
  })

  // show wiki modal
     $('#wikiModal').modal('show');
}

// generate youtube modal and show to the user
const generateYoutubeModal = country =>{
     $.ajax({
            url: "php/getApi.php",
            type: 'POST',
            dataType: 'json',
            data: {
            "api_name":'youtube',
            "country" : country
            },
                success: function(result){
                    let aboutCountry = ""
                   
        video = result['data'].items[0].id.videoId;
        
        $('#youtubeModalLabel').append(aboutCountry);
        $("#youtube_result").append(`<iframe src="https://www.youtube.com/embed/${video}?autoplay=1&controls=0&version=3&enablejsapi=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; modestbranding; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`);
    }
     })
     // show youtube modal
   $('#youtubeModal').modal('show');
}

// generate calendar modal and show to the user
const generateCalendarModal = (iso2,countryName) =>{
    addCalendarEvents(new Date().getFullYear(),iso2,countryName);  
     $('#calendarModal').modal('show');
}


// generate weather modal and show to the user
const generateWeatherModal = country =>{
    
    // convert country name to readable format with space
    country = country.replace("%20", " ");

    // get header label
    $('#weather_forecastModalLabel').append("Weather in " + country);

    // get all cities of this country
     let settings = {
        "url": "https://countriesnow.space/api/v0.1/countries/cities",
        "method": "POST",
        "timeout": 0,
        "data": { 
            "country": country
        },
      };

      // populate cites value and text in select element
      $.ajax(settings).done(function (response) {
        response.data.forEach(function (data) {
            $("<option>",{
              value: data,
              text: data
            }).appendTo("#citySelect");
          })
      });
            
      // show the modal
     $('#weather_forecastModal').modal('show');
}

// generate covid modal and show to the user
const generateCovidModal = country =>{
    // make lower case to accept api
    country = country.toLowerCase();

    // create context 2d for canvas
     let ctx = $("#covidChart")[0].getContext('2d');
   
     // make canvas fit size to our modal
    ctx.canvas.width  = Math.round(window.innerWidth / 2);
    ctx.canvas.height = Math.round(window.innerHeight / 2);
   
    // ajax call get covid-19 data for specic country name
    $.ajax({
        url: "php/getApi.php",
        type: 'POST',
        dataType: 'json',
        data: {
          "api_name":'covid_19',
          "country" : country,
        },
        success: function(result){
            $('#covidModalLabel').append("Get Covid Information In <br>" + decodeURIComponent(country.toUpperCase()));
            data = result['data'].data;
           
            // get label date for x axis and make sure is reverse order from smaller to todays day
             label_dates = Object.keys(data).reverse();
            
            // Gradient Fill, additional color for total cases
            let gradient = ctx.createLinearGradient(0,0,0,400);
            gradient.addColorStop(0, 'rgba(58,123,213,1');
            gradient.addColorStop(1, 'rgba(0,210,255,0.3');

            // configuration of all data be used in chart
            const myData = {
                labels: label_dates,
                datasets: [
                    {
                    data: [],
                    label: "Total Cases",
                    fill: true,
                    backgroundColor: gradient
                },
                {
                    data: [],
                    label: "Deaths",
                    fill: true,
                    backgroundColor: 'red'
                },
                {
                    data: [],
                    label: "Critical",
                    fill: true,
                    backgroundColor: 'purple'
                },
                {
                    data: [],
                    label: "Recovered",
                    fill: true,
                    backgroundColor: "green"
                },
                {
                    data: [],
                    label: "Tested",
                    fill: false,
                    backgroundColor: "yellow"
                },
                {
                    data: [],
                    label: "Death Ratio",
                    fill: false,
                    backgroundColor: "black"
                },
                {
                    data: [],
                    label: "Recovery Ratio",
                    fill: false,
                    backgroundColor: "#ff00aa"
                }
            ]
            }

            // get all info and set to our datasets, this data will be used to create y axis in chart 
            for(let i = 0 ; i < label_dates.length;i++ ){
                if(data[label_dates[i]] !== undefined){
                    myData.datasets[0].data.push(data[label_dates[i]].total_cases);
                    myData.datasets[1].data.push(data[label_dates[i]].deaths);
                    myData.datasets[2].data.push(data[label_dates[i]].critical);
                    myData.datasets[3].data.push(data[label_dates[i]].recovered);
                    myData.datasets[4].data.push(data[label_dates[i]].tested);
                    myData.datasets[5].data.push(data[label_dates[i]].death_ratio);
                    myData.datasets[6].data.push(data[label_dates[i]].recovery_ratio);
                }
            }
       
            const config = {
                type: 'line',
                data: myData,
                options: {
                    responsive: true,
                },
            };
            
            // create chart using configuration 
             covidChart = new Chart(ctx, config);
        }
    });
    // show the modal 
    $('#covidModal').modal('show');
}

// MODALS CLOSING FUNCTIONS
// weather forecast closing
$('#weather_forecastModal').on('hide.bs.modal', ()=>{ 
    // erase all labels in forecast module
    $("#citySelect").html("");
    $('#weather_forecastModalLabel').html("");
    $('.weather_result').html("");

})

// youtube closing
$('#youtubeModal').on('hide.bs.modal', ()=>{ 
    $("#youtube_result").html("");
    $('#youtubeModalLabel').html("");
})

// covid closing
$('#covidModal').on('hide.bs.modal', ()=>{ 
    $('#covidModalLabel').html("");
    covidChart.destroy();
})
   
// calendar closing
$('#calendarModal').on('hide.bs.modal', ()=>{ 
    $("#calendarModalLabel").html("");
    $("#holiday_table").html("");
    $('#calendar').evoCalendar('destroy');
})

// country cities closing
$('#country_citiesModal').on('hide.bs.modal', ()=>{ 
    // erase fields
            $(".languages").html("");
            $(".topbigcities").html("");
            $(".topsmallcities").html(""); 
})