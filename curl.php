<?php

    // Get cURL resource
    $curl = curl_init();
    curl_setopt_array($curl, array(
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_URL => 'http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apiKey=0ea40d82-832e-43ba-ba4b-5bb9539de1d3',
        CURLOPT_USERAGENT => ''
    ));
    // Send the request & save response to $resp
    $resp = curl_exec($curl);
    // Close request to clear up some resources
    curl_close($curl);
    
    $result_arr = json_decode($resp, true);
    
    print_r($resp);
    
?>