const $ = require('jquery');

// const data = [
//   {name: "Darcey Winters", lat: 52.87258702448279, long: -8.473160215897666},
//   {name: "Kasey Ortiz", lat: 52.21560864111873, long: -9.032489188734193},
//   {name: "Daniela Shaffer", lat: 53.50814306635446, long: -9.553096198984093},
//   {name: "Hugo Newton", lat: 52.27845993677177, long: -7.573323061414043},
//   {name: "Henri Hutchinson", lat: 53.52122313665498, long: -6.774081313283913},
//   {name: "Elspeth Roy", lat: 54.12714573770424, long: -8.790516916364519},
//   {name: "Haroon Wong", lat: 52.77363459517103, long: -9.274461461103863},
//   {name: "Dawud Hodge", lat: 52.8002418962467, long: -7.763967882068939},
//   {name: "Tanisha Meyer", lat: 53.760309507791376, long: -6.664093916752243},
//   {name: "Connor Michael", lat: 51.99944204818475, long: -9.69974606102632},
// ];

// const event = {
//   name: "World Cup", 
//   lat: 52.96396092186581, 
//   long: -7.639315499333046
// };

let data;

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
  array.forEach(ele => {
    $("#list").append(`<li>${ele.name} - ${Math.round(ele.distance)} km</li>`);
  });
}

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
  
  $("li").remove()
  let input = $("#coords").val();
  input = input.split(",");
  input[0] = input[0].trim();
  input[1] = input[1].trim();
  const new_event = {name: "input event", latitude: input[0], longitude: input[1]};
  update_list(calculate_distance(data, new_event));
  // update_name(new_event);

}

$( document ).ready(function() {
// jQuery(() => {

  $("#drop_zone").on("drop", (event) => dropHandler(event));
  $("#drop_zone").on("dragover", (event) => dragOverHandler(event));
  $("#event_form").on("submit", (event) => handleSubmit(event));

  $("#data_zone").hide();
  
});