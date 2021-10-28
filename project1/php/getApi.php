<?php

    // check if server local or not
  $server = $_SERVER['SERVER_NAME'];
    if($server === "localhost")
    {
        $server .= '/andriusAlimas';
    }

     $show = false; // just variable to check formating
     $data = 'data';
     $default = false;
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    
    if((isset($_REQUEST['api_name'])) && ($_REQUEST['api_name']!=null)){
        $api_name = $_REQUEST['api_name'];
    }else{
        $api_name = "no name";
    }

    switch($api_name){
       case 'countryBorders':
            $url = 'https://'.$server.'/project1/json/countryBorders.geo.json';
            break;
       case 'countries':
            $url='https://api.opencagedata.com/geocode/v1/json?key=2d40209da4f34c91a11e862854bfe317&q='.$_REQUEST['q'];
            $data = 'results';
            break;
        default:
        $default = true;
        // $output['accessToken']= '04yVMx6BriAAM2GxEbC0LLWicl9TJ5qCrka3agfo47w2WkFC99LicZd5yBRpggu8';
        $output['accessToken']= 'jpsJu9BjZoAekptrawpM'; // later on we need to encrypt this some how
        break;    
    }
    
    if(!$default){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_URL,$url);
    
        $result=curl_exec($ch);
        curl_close($ch);
        $decode = json_decode($result,true);  
    }else{
        $decode = json_decode($output['accessToken'],true);  
    }
 
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    
    // $output[$data] = $decode;
 // because some decode is different we need to make sure its right format
 if($show == true){ 
    $output['data'] = $decode[$api_name];
}else{
    $output[$data] = $decode;   
}
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);

?>
