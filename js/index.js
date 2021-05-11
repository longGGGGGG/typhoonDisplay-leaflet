// demo map
var mapStuff = initDemoMap();
var map = mapStuff.map;
var layerControl = mapStuff.layerControl;

layerControl.addTo(map)

// $.getJSON("./data/wind-gbr.json", function (data) {
//   var velocityLayer = L.velocityLayer({
//     displayValues: true,
//     displayOptions: {
//       velocityType: "GBR Wind",
//       position: "bottomleft",
//       emptyString: "No wind data",
//       showCardinal: true
//     },
//     data: data,
//     maxVelocity: 10
//   });

//   layerControl.addOverlay(velocityLayer, "Wind - Great Barrier Reef");
// });

// $.getJSON("./data/water-gbr.json", function (data) {
//   var velocityLayer = L.velocityLayer({
//     displayValues: true,
//     displayOptions: {
//       velocityType: "GBR Water",
//       position: "bottomleft",
//       emptyString: "No water data"
//     },
//     data: data,
//     maxVelocity: 0.6,
//     velocityScale: 0.1 // arbitrary default 0.005
//   });

//   layerControl.addOverlay(velocityLayer, "Ocean Current - Great Barrier Reef");
// });

// $.getJSON("./data/wind-global.json", function (data) {
//   var velocityLayer = L.velocityLayer({
//     displayValues: true,
//     displayOptions: {
//       velocityType: "Global Wind",
//       position: "bottomleft",
//       emptyString: "No wind data"
//     },
//     data: data,
//     maxVelocity: 15
//   });
//   velocityLayer.addTo(map);
//   layerControl.addOverlay(velocityLayer, "Wind - Global");
// });

// /**/
// // var typhoonlist = L.control.typhoonlist();
// // typhoonlist.addTo(map);
// // layerControl.addOverlay(typhoonlist);
// $(".leaflet-control-layers-list").prepend("<strong class='title'>基础图层</strong><br>");
// $(".leaflet-control-layers-separator").after("<strong class='title'>风场</strong><br>");