<?php
    $show = true; // just variable to check formating
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    $api = dashesToCamelCase($_REQUEST['api_name']);
    
    switch($api){
        case 'weatherObservation': 
            $url='http://api.geonames.org/findNearByWeatherJSON?lat='.$_REQUEST['lat']. '&lng='.$_REQUEST['lng'].'&radius='.$_REQUEST['radius'].'&username=andriusAlimas';
            break;
        case 'locations':
            $url='https://api.myptv.com/geocoding/v1/locations/by-text?searchText='.$_REQUEST['place'].'&apiKey=YzJkYmU4NTkwOTViNGVkZmJmYmZiMGRjZmJkZmIxMmU6M2QwZTYyMjgtMzMzNy00N2M3LWEwZDEtNzIwYzE0ZmYxZWY2';
            break;
        case 'geonames' :
            $url='http://api.geonames.org/wikipediaSearchJSON?q='.$_REQUEST['q'].'&title='.$_REQUEST['title'].'&username=andriusAlimas';
            break;
        default:
            $show = false; // different format change to false
            $url = 'http://api.geonames.org/timezoneJSON?lat='.$_REQUEST['lat'].'&lng='.$_REQUEST['lng'].'&lang='.$_REQUEST['lang'].'&date='.$_REQUEST['date'].'&username=andriusAlimas';
        break;
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);
    
    curl_close($ch);
 
    $decode = json_decode($result,true);    
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    
    // because some decode is different we need to make sure its right format
    if($show === true){
        $output['data'] = $decode[$api];
    }else{
        $output['data'] = $decode;
    }
    
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

    // this function converts all empty string or dashes into camel case string
    function dashesToCamelCase($string, $capitalizeFirstCharacter = false) 
    {
    
        $str = str_replace(' ', '', ucwords(str_replace('-', ' ', $string)));
    
        if (!$capitalizeFirstCharacter) {
            $str[0] = strtolower($str[0]);
        }
    
        return $str;
    }
?>
