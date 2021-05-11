function initDemoMap() {
  // var Esri_WorldImagery = L.tileLayer(
  //   "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  //   {
  //     attribution:
  //       "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, " +
  //       "AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  //   }
  // );

  // var Esri_DarkGreyCanvas = L.tileLayer(
  //   'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
  //   {
  //     attribution:
  //       "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, " +
  //       "NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community"
  //   }
  // );

  // var OpenStreetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  // }
  // );

  var GoogleHybrid = L.tileLayer(
    "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  )
  // var baseLayers = {
  //   "Satellite": Esri_WorldImagery,
  //   "Grey Canvas": Esri_DarkGreyCanvas,
  //   "OpenStreetMap": OpenStreetMap,
  //   "GoogleHybrid": GoogleHybrid
  // };

  // var overlays = {};

  var providers = {};

    // arcgis影像
    const ArcImage =  L.tileLayer(
      "http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, " +
          "AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
      })

    // 天地图影像
    const image = L.tileLayer('http://t{s}.tianditu.gov.cn/img_w/wmts?tk=129858771db46084b3258a203cd6ea2b&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}', {
      subdomains: [0, 1, 2, 3, 4, 5, 6, 7],
    });
    // 天地图标注
    const cia = L.tileLayer('http://t{s}.tianditu.gov.cn/cia_w/wmts?tk=129858771db46084b3258a203cd6ea2b&SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TileMatrix={z}&TileCol={x}&TileRow={y}', {
      subdomains: [0, 1, 2, 3, 4, 5, 6, 7],
      transparent: true,
      zIndex: 3,
    });

    providers['GeoQ 天青'] = {
      title: 'GeoQ 天青',
      icon: 'iconLayer/icons/天青.png',
      layer: L.tileLayer('http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}', { 
      })
    };

    providers['GeoQ 藏蓝'] = {
      title: 'GeoQ 藏蓝',
      icon: 'iconLayer/icons/藏蓝.png',
      layer: L.tileLayer('http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}', { 
      })
    };
  
    providers['GeoQ 灰色'] = {
      title: 'GeoQ 灰色',
      icon: 'iconLayer/icons/灰色.png',
      layer: L.tileLayer('http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}', { 
      })
    };

    providers['OpenStreetMap_Mapnik'] = {
      title: 'Open Street',
      icon: 'iconLayer/icons/openstreetmap_mapnik.png',
      layer: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    };

    providers['Esri_OceanBasemap'] = {
      title: 'Ocean Map',
      icon: 'iconLayer/icons/esri_oceanbasemap.png',
      layer: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
        maxZoom: 13
      })
    };

    providers['CartoDB_Positron'] = {
      title: 'positron',
      icon: 'iconLayer/icons/cartodb_positron.png',
      layer: L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
      })
    };

    providers['Arcgis地图'] = {
      title: 'Arcgis地图',
      icon: 'iconLayer/icons/ArcGis.png',
      layer:   L.layerGroup([ArcImage, cia, ])
    };

    providers['天地图影像'] = {
      title: '天地图影像',
      icon: 'iconLayer/icons/天地图影像.png',
      layer: L.layerGroup([image, cia, ])
    };


  var map = L.map("map", {
    layers: [ GoogleHybrid],
    zoomControl: false,
    attributionControl: false,
    center: [35, 110],
    zoom: 3.5,
    drawControl: false,
    editable: false
  });

  var layers = [];
  for (var providerId in providers) {
    layers.push(providers[providerId]);
  }

  var layerControl = L.control.sidebar(layers)
  L.control.search({ position: "topright" }).addTo(map);
  L.control.bookmarks().addTo(map);
  L.control.zoomslider().addTo(map);

  var pulsingIcon = L.icon.pulse({iconSize:[14,14], color:'red', fillColor:'red', heartbeat:0.5});
    L.marker([40.65,119.53],{icon: pulsingIcon, title: 'This is pulsing icon'}).addTo(map);

    var pulsingIcon2 = L.icon.pulse({iconSize:[8,8], color:'blue', fillColor:'blue'});
    L.marker([37.79,92.64],{icon: pulsingIcon2,title: 'This is pulsing icon'}).addTo(map);

    var pulsingIcon3 = L.icon.pulse({iconSize:[12,12], color:'green', fillColor:'green'});
    L.marker([22,120],{icon: pulsingIcon3, title: 'This is pulsing icon'}).addTo(map);

  return {
    map: map,
    layerControl: layerControl
  };
}