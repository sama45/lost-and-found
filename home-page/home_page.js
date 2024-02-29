var timeouts = [];


// (incomplete) dictionary to map tagIDs to their respective Font Awesome icons
const tagIDToIcon = {
    "0": "fa-solid fa-map-pin", // used for default icon
    "1": "fa-solid fa-camera",
    "1.1": "fa-solid fa-tree",
    "1.1.1": "fa-solid fa-binoculars",
    "1.1.2": "fa-solid fa-tornado fa-rotate-180", // used for waterfall icon since no waterfall icon exists 
    "1.1.3": "fa-solid fa-mountain",
    "1.1.4": "fa-solid fa-icicles", // used for cave icon since no cave icon exists
    "1.1.5": "fa-solid fa-umbrella-beach",
    "1.2.1": "fa-solid fa-place-of-worship",
    "1.2.2": "fa-solid fa-building",
    "1.2.3": "fa-solid fa-palette",
    "1.2.4": "fa-solid fa-road",
    "2": "fa-solid fa-burst",
    "2.1": "fa-solid fa-building-columns",
    "2.2": "fa-solid fa-store",
    "2.3": "fa-solid fa-utensils"
}; 

//Calls the function 'callback' after a certain amount of time 'delay'
function SetDelayedFunction(callback, delay){
    var timer = setTimeout(callback, delay);
    timeouts.push(timer);
    return timer;
}

//cancels any DelayedFunctions waiting to happen
function ClearAllTimeouts(){
    for (let i = 0; i < timeouts.length; i++){
        clearTimeout(timeouts[i]);
    }
    timeouts = [];
}

//Adds a place to the database once the user clicks submit
function SubmitPlace() {

    /*let route = new Route("testing route", 3, 1, "0");
    let place = new Place(3, "23, 47", "jhasfjkfa", "oiaf", "afaf", "afafs", "okkjafa");
    let place2 = new Place(56, "23, 47", "fhdgds", "oiasgagf", "afasgasasgaf", "asggags", "okkjafaagasgag");
    let place3 = new Place(78, "23, 47", "asgasgasgagag", "agsasgasg", "asgasgasgagga", "agagasgag", "gasgagagsagga");

    route.AddPlace(place);
    route.AddPlace(place2);
    route.AddPlace(place3);

    route.StoreRoute();
    return;*/ //this is for testing whether storing routes works
    
    ClearAllTimeouts();

    //Retrieve the inputted data
    var tag_select_box = document.getElementById("tag-selector");

    const PLACE_NAME = document.getElementById("place_name").value;
    const LOCATION = document.getElementById("location").value;
    const PLACE_DESCRIPTION = document.getElementById("place_description").value;
    const PLACE_TAG = tag_select_box.value;


    
    var button = document.querySelector(".submission_button");
    button.textContent = "Submitting...";

    //Puts the word 'Submit' back in the button after 500 milliseconds
    SetDelayedFunction(function() {button.textContent = "Submit";}, 500);
    SetDelayedFunction(function() {document.getElementById("responseContainer").innerHTML = "";}, 5000);

    //Checks and alerts if any of the fields are empty
    if (PLACE_NAME.trim() === "" || LOCATION.trim() === "" || PLACE_DESCRIPTION.trim() === "") {
        var error_message = document.getElementById("errorMessage");
        error_message.textContent = "Please fill all fields.";
        error_message.style.display = "block";
        SetDelayedFunction(function() {error_message.textContent = ""; error_message.style.display = "none";}, 10000);
        document.getElementById('responseContainer').textContent="";
        return;
    }

    //Checks and alerts if the location is not valid
    if (!isValidLocation(LOCATION)){
        var error_message = document.getElementById("errorMessage");
        error_message.textContent = "Invalid location. Please try again.";
        error_message.style.display = "block";
        SetDelayedFunction(function() {error_message.textContent = ""; error_message.style.display = "none";}, 10000);
        return;
    }

    //Clear all the entries
    document.getElementById("place_name").value = "";
    document.getElementById("location").value = "";
    document.getElementById("place_description").value = "";
    document.getElementById("errorMessage").textContent="";
    document.getElementById('responseContainer').textContent="";
    document.getElementById("tag-selector").value="0";
    //Accesses the database by calling the store_place_home.php script
    xhr = new XMLHttpRequest();
    xhr.open("POST", "store_place_home.php", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    //Checks and alerts that request was successful (indicated by a status of 200)
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const response_text = xhr.responseText;
                document.getElementById("responseContainer").innerHTML = response_text;
                initMap(false);
            } 
            else {
                console.error('Error occurred: ' + xhr.status);
            }
        }
    };
    xhr.send("place_name=" + PLACE_NAME + "&location=" + LOCATION + "&place_description=" + PLACE_DESCRIPTION + "&place_tag=" + PLACE_TAG);
}
//this function calls php code to return all place data from the database - more can be added as needed
async function getPlaceData() {
    var placeData;
    await jQuery.ajax({
      type: "POST",
      url: 'getPlaces.php',
      dataType: 'json',
      data: {functionname: 'getPlaces'},
  
      success: function (obj, textstatus) {
                    if( !('error' in obj) ) {
                        placeData = obj.result;
                    }
                    else {
                        console.log(obj.error);
                    }
              }
    }).done(function(data) {
      var placeData = data;})
      .fail(function( xhr, status, errorThrown ) {
        alert("Sorry, there was a problem!"); //annoying but useful
        console.log("Error: " + errorThrown);
        console.log("Status: " + status);
        console.dir(xhr);
      });
  
    return await placeData;
  
    
    
  
  
  }
//We only want one map, so declare it here
var map;
//Initialises Google Maps API. Async keyword means it runs without freezing the entire program
async function initMap(first_init = true) {

    
    //call getPlaceData function
    var placeData = await getPlaceData();

    console.log(placeData);
    const {Map,InfoWindow} = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
        "marker",
      );

    
    //Only want to initialise the map when the page is opened for the first time
    if (first_init){
        map = new Map(document.getElementById('map'), {
        center: { lat: 53.45621235073006, lng: -2.2282816409214923 },
        zoom: 10,
        draggableCursor: 'auto',
        draggingCursor: 'move',
        mapTypeControl: false,
        mapId: 'DEMO_MAP_ID',
    }); 
    }
    
    //define an infowindow so all markers can have one on click
    /*const infoWindow = new google.maps.InfoWindow({
        content: "",
        disableAutoPan: true,
      });*/

    //define markers based on placeData array, add a listener to all of them
    const markers = placeData.map((element,i) => { //go through every element of placedata, make a marker with attached infowindow out of it
        const marker = new google.maps.marker.AdvancedMarkerElement({
        position : ({ lat: parseFloat(element.latitude), lng : parseFloat(element.longitude)}),
        map, //might need to remove this to make marker clustering work
        content: buildContent(element),
        });
    
    
        marker.addListener("click", () => { //add an infowindow to each marker just for fun
          //infoWindow.setContent(element.PlaceName + '\n' + element.PlaceDesc);
          //infoWindow.open(map, marker);
          //document.getElementById('browse_place_name').value = element.PlaceName; //this lines can be included when the pages exist
          //document.getElementById('browse_place_description').value = element.PlaceDesc; //this lines can be included when the pages exist
          //document.getElementById('browse_location').value = element.latitude + ', ' + element.longitude; //this lines can be included when the pages exist
          toggleHighlight(marker, element);

        });

        return marker;



    
    });

    const clusterer = new markerClusterer.MarkerClusterer({ map, markers });

    

    var clickMarker = new google.maps.Marker; //maybe advancedMarkerElement?


    //Add an event listener for map clicks
    map.addListener('click', function(event) {
        var geocoder = new google.maps.Geocoder();
        var location = event.latLng;
        var latitude = event.latLng.lat();
        var longitude = event.latLng.lng();
        document.getElementById('location').value = longitude + ', ' + latitude;

        clickMarker.setMap(null)

        clickMarker = new google.maps.Marker({ //displays a marker wherever you last clicked! - we can make the marker look nicer whenever using advancedmarkerelement
            position: {lat: latitude, lng: longitude},
            map,
        })

        //Get the clicked location's details
        geocoder.geocode({ 'location': location }, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                    var placeName = results[0].name || '';
                    var formattedAddress = results[0].formatted_address || '';

                    document.getElementById('place_name').value = placeName;
                    document.getElementById('place_description').value = formattedAddress;
                }
            } else {
                console.error('Geocoder failed due to: ' + status);
            }
        });
    });
    document.getElementById("transparent_container").classList.add("slide-in-transparent-container");
    document.getElementById("icon").classList.add("slide-in-transparent-container");
}

//Called each time the Search Location bar is changed, and tries to find the input location.
function FindLocation(){
    var geocoder = new google.maps.Geocoder();
    var address = document.getElementById("searchbar").value;
    document.getElementById("place_name").value = capitalizeWords(address);
    var button = document.getElementById("search-btn");
    button.classList.add("expand-and-contract");
    setTimeout(function() {
        button.classList.remove("expand-and-contract");
    }, 500);
    //Geocodes the address
    geocoder.geocode({ 'address': address }, function(results, status) {

        //If the input address was successfully matched against one by google
        if (status === 'OK') {

            //Stores a more accurate address generated by google and displays it in the description box
            var google_address = "";
            if (results[0]){
                google_address = results[0].formatted_address;
                document.getElementById("place_description").value = google_address;
            }
            
            var location = results[0].geometry.location;
            var latitude = location.lat();
            var longitude = location.lng();
    
            document.getElementById('location').value = longitude + ', ' + latitude;
 
            map.setCenter({ lat: latitude, lng: longitude });
            map.setZoom(15);

        }
    });
}

//creates content for advanced html info on each marker - just a simplified version for now, this could easily be updated to include whatever info we want!
function buildContent(element) {
    const content = document.createElement("div");

    content.classList.add("element");
    content.innerHTML = `
    <div class = "icon">
        <i aria-hidden = "true" class = "fa fa-icon fa-house marker_icon" title="marker_icon"></i>
        <span class="fa-sr-only">${element.PlaceName}</span>
    </div>
    <div class = "details">
        <div class = "place_name">
        <p>${element.PlaceName}</p>
        </div>
        <div class = "place_desc" style = "{width: 30em; word-wrap: normal;}">
        <p>${element.PlaceDesc}</p>
        </div>
    </div>
    
    `;
    return content;
}

//toggles whether advanced html info shows for a marker on home page
function toggleHighlight(markerView, property) {
    if (markerView.content.classList.contains("highlight")) {
      markerView.content.classList.remove("highlight");
      markerView.zIndex = null;
    } else {
      markerView.content.classList.add("highlight");
      markerView.zIndex = 1;
    }
  }
  


//Changes the map location each time they manually enter a valid latitude and longitude
function LocationInputChanged(){
    var coordinates = document.getElementById("location").value;
    coordinates = coordinates.trim().replace(/\s/g, '');
    numbersArray = coordinates.split(",");
    var latitude = parseFloat(numbersArray[0]);
    var longitude = parseFloat(numbersArray[1]);
    if (containsOnlyNumbers(latitude) && containsOnlyNumbers(longitude)){
        map.setCenter({ lat: latitude, lng: longitude });
    }
}

//Checks that the string is a number
function containsOnlyNumbers(input_string){
    var regex = /^\s*-?\d+(\.\d+)?\s*$/;
    return regex.test(input_string);
}

//Converts the passed in string into title case
function capitalizeWords(inputString) {
    var excludedWords = ["of", "the", "as", "and", "or", "in", "on", "a"]; // List of excluded words
    var words = inputString.toLowerCase().split(" ");
    for (var i = 0; i < words.length; i++) {
        if (i === 0 || !excludedWords.includes(words[i])) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
    }
    return words.join(" ");
}

//Checks that the location in the text box is a valid Latitude, Longitude
function isValidLocation(location){
    var regex = /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/;
    return regex.test(location);
}

function AddMarkerClicked(){
    HideAllInputDivs();
    var div = document.getElementById("add_marker_input_box");
    div.style.display="block";
    div.classList.add("slide-in");

    var button = document.getElementById("AddMarkerButton");
    button.classList.add("expand-and-contract");
    setTimeout(function() {
        button.classList.remove("expand-and-contract");
    }, 500);
}

function AddRouteClicked(){
    HideAllInputDivs();
    var div = document.getElementById("add_route_input_box");
    div.style.display="block";
    div.classList.add("slide-in");

    var button = document.getElementById("AddRouteButton");
    button.classList.add("expand-and-contract");
    setTimeout(function() {button.classList.remove("expand-and-contract");}, 500);
    
}
function BrowseMarkersClicked(){
    HideAllInputDivs();
    var div = document.getElementById("browse_markers_input_box");
    div.style.display="block";
    div.classList.add("slide-in");

    var button = document.getElementById("BrowseMarkersButton");
    button.classList.add("expand-and-contract");
    setTimeout(function() {
        button.classList.remove("expand-and-contract");}, 500);
}
function BrowseRoutesClicked(){
    HideAllInputDivs();
    var div = document.getElementById("browse_routes_input_box");
    div.style.display="block";
    div.classList.add("slide-in");

    var button = document.getElementById("BrowseRoutesButton");
    button.classList.add("expand-and-contract");
    setTimeout(function() {
        button.classList.remove("expand-and-contract");}, 500);
}
function HideAllInputDivs(){
    //needs to be updated to hide all the other divs that are to be created
    document.getElementById("add_marker_input_box").style.display="none";
    document.getElementById("add_route_input_box").style.display="none";
    document.getElementById("browse_routes_input_box").style.display="none";
    document.getElementById("browse_markers_input_box").style.display="none";
}

async function submit_search_place() { //searches database for the place - we do a lil fuzzy search??? also maybe move map centre to the marker you find.
    /* ADD SOME ERROR CHECKING */
    var location;
    var name = document.getElementById("search_places").value;
    await jQuery.ajax({
        type: "POST",
        url: 'getPlaces.php',
        dataType: 'json',
        data: {functionname: 'searchPlace', arguments: [name]},
    
        success: function (obj, textstatus) {
                      if( !('error' in obj) ) {
                          location = obj.result;
                      }
                      else {
                          console.log(obj.error);
                      }
                }
      }).done(function(data) {
        var location = data;})
        .fail(function( xhr, status, errorThrown ) {
          alert("Sorry, there was a problem!"); //annoying but useful
          console.log("Error: " + errorThrown);
          console.log("Status: " + status);
          console.dir(xhr);
        });
    //map.setZoom(4);
    map.panTo({lat:parseFloat(location[0].latitude),lng:parseFloat(location[0].longitude)});
    //map.setZoom(12);
}

function TagChanged(){
    return;
    //do this if we manage to find images for each tag.
    var tag_select_box = document.getElementById("tag-selector");

    var selectedOption = tag_select_box.options[tag_select_box.selectedIndex];

    var selectedID = selectedOption.id;

    displayed_icon = document.getElementById("tag-image")
    displayed_icon.src = "home-images/tag-images/" + selectedID + "_tag_icon.png";
}