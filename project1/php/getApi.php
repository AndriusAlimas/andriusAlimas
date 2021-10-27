<?php

    // check if server local or not
  $server = $_SERVER['SERVER_NAME'];
    if($server === "localhost")
    {
        $server .= '/andriusAlimas';
    }

     $show = true; // just variable to check formating
     $data = 'data';
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    $api_name = $_REQUEST['api_name'];
    switch($api_name){
       case 'countryBorders':
        $show = false;
        $url = 'http://'.$server.'/project1/json/countryBorders.geo.json';
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
