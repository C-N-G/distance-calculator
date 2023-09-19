const $ = require('jquery');

const debugMode = true;

let data, event, current_list, search_list;

if (debugMode) {
  data = [
    {name: "Darcey Winters", latitude: 52.87258702448279, longitude: -8.473160215897666},
    {name: "Kasey Ortiz", latitude: 52.21560864111873, longitude: -9.032489188734193},
    {name: "Daniela Shaffer", latitude: 53.50814306635446, longitude: -9.553096198984093},
    {name: "Hugo Newton", latitude: 52.27845993677177, longitude: -7.573323061414043},
    {name: "Henri Hutchinson", latitude: 53.52122313665498, longitude: -6.774081313283913},
    {name: "Elspeth Roy", latitude: 54.12714573770424, longitude: -8.790516916364519},
    {name: "Haroon Wong", latitude: 52.77363459517103, longitude: -9.274461461103863},
    {name: "Dawud Hodge", latitude: 52.8002418962467, longitude: -7.763967882068939},
    {name: "Tanisha Meyer", latitude: 53.760309507791376, longitude: -6.664093916752243},
    {name: "Connor Michael", latitude: 51.99944204818475, longitude: -9.69974606102632},
  ];

  event = {
    name: "World Cup", 
    latitude: 52.96396092186581, 
    longitude: -7.639315499333046
  };
}

function calculate_distance(input_array, input_event) {
  
  function compare(a, b) {
    if ( a.distance < b.distance ){
      return -1;
    }
    if ( a.distance > b.distance ){
      return 1;
    }
    return 0;
  }
  
  let output = [];
  
  input_array.forEach(ele => {
    
    let distance = calcCrow(ele.latitude, ele.longitude, input_event.latitude, input_event.longitude);
    
    output.push({name: ele.name, distance: distance})
    
  })
  
  output = output.sort(compare);
  
  return output;
  
}

function calcCrow(lat1, lon1, lat2, lon2) {
  
  function toRad(Value) {
    return Value * Math.PI / 180;
  }
  
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  
  return d;
}

function update_list(array) {
  $("#list").children().remove();
  array.forEach(ele => {
    $("#list").append(`<li>${ele.name} - ${Math.round(ele.distance)} km</li>`);
  });
}

// to be used with a event saving mechanism for loading reasons
function update_name(event) {
  $("#text").text(`The event is the ${event.name}`);
}

function dropHandler(event) {
  event.preventDefault();

  event = event.originalEvent;

  const file = event.dataTransfer.items[0].getAsFile();

  const reader = new FileReader();
  reader.onload = (evt) => {
    data = readCSV(evt.target.result);
    $("#help_text").text("Please input event coordinates");
    $("#drop_zone").hide();
    $("#data_zone").show();
  };
  reader.readAsText(file);

}

function dragOverHandler(event) {
  event.preventDefault();
}

function readCSV(data) {

  let formatted = data.split(/\r?\n/);

  formatted.shift();

  formatted = formatted.map(e => {
    e = e.split(",");
    return {name: e[0], latitude: e[1], longitude: e[2]};
  })

  return formatted;

}

function handleSubmit(event) {

  event.preventDefault();
  
  let input = $("#coords").val();
  input = input.split(",");
  input[0] = input[0].trim();
  input[1] = input[1].trim();
  event = {name: "input event", latitude: input[0], longitude: input[1]};
  current_list = calculate_distance(data, event);
  update_list(current_list);

}

/**
 * handles the search logic when filtering names
 * @param {Object} event - the search event generated from this form submission
 */
function handleSearch(event) {

  /**
   * updates the search list depending on the arguments
   * @param {string} string - new string to add or remove
   * @param {bool} remove - flag if the string should be remove or not
   */
  function update_search(string, remove) {

    // remove or add a search item to the earch list
    if (remove) {
      search_list = search_list.filter((ele) => ele !== string.toLowerCase().trim());
    } else {
      search_list.push(string.toLowerCase().trim());
    }
    
    // apply the search list to the current list output
    let new_list;
    if (search_list.length > 0) {
      // for each element in the current list
      new_list = current_list.filter((ele) => {
        let name = ele.name.toLowerCase();
        // check it against each element in the search list
        for (let i = 0; i < search_list.length; i++) {
          // to see if the element in the search list is a substring of the element of the current list
          if (name.includes(search_list[i])) return true;
        }
        // if no element is found then return false to not include it
        return false; 
      });
    } else {
      // otherwise do not filter the current list
      new_list = current_list;
    }

    update_list(new_list);
  }

  event.preventDefault();
  let input = $("#search").val();

  // do not do anything if the string is already in the list
  if (search_list.includes(input.toLowerCase().trim())) {
    $("#search").val("");
    return;
  } 

  // create the button to show the search param
  let button = document.createElement("button");
  button.innerText = input + " (x)";
  button.classList.add("search-name")
  button.onclick = () => {
    button.remove();
    update_search(input, true);
  }
  $("#search_list").append(button);

  // update the search list
  update_search(input, false);
  $("#search").val("");

}

function handleClearSearch(event) {
  
  event.preventDefault();
  $("#search_list").children().remove();
  $("#search").val("");
  search_list = [];
  update_list(current_list);

}

function debug() {
  $("#help_text").text("Please input event coordinates");
  $("#drop_zone").hide();
  $("#data_zone").show();
  current_list = calculate_distance(data, event);
  update_list(current_list);
}

$( document ).ready(function() {
// jQuery(() => {

  search_list = [];

  $("#drop_zone").on("drop", (event) => dropHandler(event));
  $("#drop_zone").on("dragover", (event) => dragOverHandler(event));
  $("#event_form").on("submit", (event) => handleSubmit(event));
  $("#search_form").on("submit", (event) => handleSearch(event));
  $("#clear_search").on("click", (event) => handleClearSearch(event));

  $("#data_zone").hide();

  if (debugMode) debug();
  
});