<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $url='http://api.geonames.org/findNearByWeatherJSON?lat='.$_REQUEST['lat']. '&lng='.$_REQUEST['lng'].'&radius='.$_REQUEST['radius'].'&username=andriusAlimas';
  
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
    $output['data'] = $decode[dashesToCamelCase($_REQUEST['api_name'])];
    
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
