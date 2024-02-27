<?php


header('Content-Type: application/json');

$aResult = array();

if( !isset($_POST['functionname']) ) { $aResult['error'] = 'No function name!'; }

//echo $_POST['functionname'];
//if( !isset($_POST['arguments']) ) { $aResult['error'] = 'No function arguments!'; }

if( !isset($aResult['error']) ) {

    switch($_POST['functionname']) { //using switch case in case i ever want to call different functions with this code
        case 'getPlaces':
            $aResult['result'] = getPlaces();
            //echo $aResult; //just check if it's working; we really want to send back a json
            break;
        default:
            $aResult['error'] = 'Not found function '.$_POST['functionname'].'!';
            echo '2b';
            break;
    }

}

echo json_encode($aResult);

function getPlaces() { //this function works! don't mess around too much pls :) - THIS IS A FAT LIE FROM ME SOZ - had to change a column name in db to make it work as 'Location' is a php keyword i think
    $database_host = "dbhost.cs.man.ac.uk";
    $database_user = "j22352sa";
    $database_pass = "cooldatabasepassword";
    $database_name = "2023_comp10120_cm7";
    $conn = new mysqli($database_host,$database_user, $database_pass, $database_name);
    if($conn->connect_error){
        echo 'Connection to Database Error';
    }

    $sqlGetPlaces = "SELECT PlaceName, ST_X(Location) as longitude, ST_Y(Location) as latitude, PlaceDesc FROM Place"; //why is querying Location returning an error? - supposedly backticks prevent it from being read as a keyword but it still doesn't work


    $result = mysqli_query($conn, $sqlGetPlaces); //returns mysqli_result object not array ! (im a fool)
    $return = array();
    if (mysqli_num_rows($result) > 0) {
        foreach($result as $row) {
            $return[] = $row;
            //echo $row['LocationLatLng']; //checking LocationLatLng actually returned; 
        }
    } else {
        $return = 'Query Failed'; //this is not a good error message but
    }
    $conn->close();
    return $return;
}



?>