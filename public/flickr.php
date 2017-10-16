<?php

  // Empty array to begin constructing object which will be encoded and sent to front end
  $response = [];
  $response['error'] = null;
  $response['status'] = 1;
  $response['data'] = [];

  // tags are formatted into uri safe string before the getJson request is made in JS
  $tags = urlencode($_GET['tagUri']);
  // query string
  $query = 'https://api.flickr.com/services/feeds/photos_public.gne?tagmode=all&format=json&nojsoncallback=1&tags='.$tags;

  // open curl session
  $ch = curl_init();
  // set curl options
  curl_setopt($ch, CURLOPT_URL, $query);
  curl_setopt($ch, CURLOPT_CONNECTTIMEOUT ,0);
  curl_setopt($ch, CURLOPT_TIMEOUT, 5);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  // Turn off SSL
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
  // execute curl session
  $data = curl_exec($ch);
  //Get any error info
  $errno = curl_errno($ch);
  $error = curl_error($ch);
  $response['error'] = $error;

  $resultStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  //echo $data . "<br>";
  //echo $errno . "<br>";
  //echo $error . "<br>";
  curl_close($ch); // close curl session

  //If there was a successful http response from the curl request
  if ($resultStatus == 200) {
    $jsonDecoded = json_decode( $data ); // stdClass object

    if ( $jsonDecoded->items && count($jsonDecoded->items) > 0 ) {
      $response['error'] = null;
      $response['status'] = 1;
      foreach ( $jsonDecoded->items as $item ) {
        // Construct an object containing relevant information to be returned on the web page, no need to include everything that isn't being used. By converting it into these objects instead of passing through the exact response I could add inputs from other sources that aren't just the flickr api.
        $item_details = array(
          "title" => $item->title,
          "url" => $item->link,
          "imgSrc" => $item->media->m,
          "tags" => $item->tags
        );
        $response['data'][] = $item_details;
      }

    } else {
      $response['error'] = "No results";
      $response['status'] = 0;

    }
  } else {
    $response['error'] = "Not a valid HTTP response (".$resultStatus.")";
    $response['status'] = 0;
  }
  $finalJson = json_encode($response, JSON_FORCE_OBJECT);
  echo $finalJson;
  return $finalJson;



  //If using php_serial format unserialize the data and all info is in resulting array
  /****
  $output = unserialize ($data);
  print_r($output);
  ****/

  //If not using curl
  /*$flickrString = file_get_contents($query);
  echo $flickrString;*/
?>
