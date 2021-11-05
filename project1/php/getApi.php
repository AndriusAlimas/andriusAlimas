<?php
    // check if server local or not
  $server = $_SERVER['SERVER_NAME'];
    if($server === "localhost")
    {
        $server .= '/andriusAlimas';
    }

     $show = false; // just variable to check formating
     $showCities = false; // just variable to check if show country cities when need it
     $data = 'data';
     $default = false;
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);
    
    // receive api name, then we use in switch 
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
        case 'countries_cities':   
              $showCities = true; 
        case 'countries_details':
            // if you want cities change curl to different call
            if($showCities){
                $url = 'https://countries-cities.p.rapidapi.com/location/country/'.$_REQUEST['isoa2'].'/city/list?page=1&per_page=100&population='.$_REQUEST['population'];
            }
            else{
                $url = 'https://countries-cities.p.rapidapi.com/location/country/'.$_REQUEST['isoa2'];
            }

            $curl = curl_init();
            curl_setopt_array($curl, [ 
                CURLOPT_URL => $url ,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "GET",
                CURLOPT_HTTPHEADER => [
                    "x-rapidapi-host: countries-cities.p.rapidapi.com",
                    "x-rapidapi-key: 9b655893f9mshb01f5c9d312d303p1a5424jsncf783eff3535"
                ],
            ]);
            
            $response = curl_exec($curl);
                $err = curl_error($curl);

                curl_close($curl);

                if ($err) {
                    echo "cURL Error #:" . $err;
                } else {
                    $decode = json_decode($response,true);  

                    
                $output['status']['code'] = "200";
                $output['status']['name'] = "ok";
                $output['status']['description'] = "success";
                $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
                $output[$data] = $decode;   
                    header('Content-Type: application/json; charset=UTF-8');
                    echo json_encode($output);
                    exit;
                }
        default:
        $default = true;
        $output['accessToken']= '04yVMx6BriAAM2GxEbC0LLWicl9TJ5qCrka3agfo47w2WkFC99LicZd5yBRpggu8'; // later on we need to encrypt this somehow
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
    
 // because some decode is different we need to make sure its right format
 if($show == true){ 
    $output['data'] = $decode[$api_name];
}else{
    $output[$data] = $decode;   
}
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($output);
?>
