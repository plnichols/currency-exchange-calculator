<?php
    
    // Variables
    $urlParam = (isset($_GET['param'])) ? $_GET['param'] : "";
    $url = "https://api-sandbox.transferwise.com/api/v1/" . $urlParam;
    $key = "ypfac431vbs3qs98772vxvxc923vzv19";
    $useragent = "TransferWise/1.0.0 (Android)";


    
    // Get data from a URL
    function get_data($url, $key, $useragent) {
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);        
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER,false);        
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_USERPWD, "apiclient:testPass4APIFunctionality");
        curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'X-Authorization-key: '.$key,
            'X-Authorization-token: '
        ));
        
        $data = curl_exec($ch);

        if(!curl_exec($ch)){
            die('Error: "' . curl_error($ch) . '" - Code: ' . curl_errno($ch));
        }

        curl_close($ch);
        return $data;
    }
        
    echo get_data($url, $key, $useragent);
?>