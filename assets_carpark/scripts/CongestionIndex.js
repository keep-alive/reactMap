import L from 'leaflet';
import LE from 'esri-leaflet';
import * as lmap from '../libs/lmap';
import taxi_img from '../images/local_taxi.png';

export function addGracLayer(layerName, data) {
    console.log(data);
    switch (layerName.id) {
        case 'cross':
            crossLayer(data);
            break;
        case 'road':
            roadLayer(data);
            break;
        case 'area':
            areaLayer(data);
            break;
        default:
            break;
    }

}

const crossLayer = function(data) {
    map.eachLayer((layer) => {
        if (layer.options.id != 'crossLayer' && layer.options.id != 'streetLayer')
            map.removeLayer(layer);
    });

    /*这个GeoJsonPoints是需要后台请求的*/
    /*var GeoJsonPoints = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6672, 45.5254]
            },
            "properties": {
                dasdqdasd: 121
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6662, 45.5262]
            },
            "properties": {
                "index": "2"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6651, 45.5255]
            },
            "properties": {
                "index": "3"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6672, 45.5262]
            },
            "properties": {
                "index": "4"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6673, 45.5268]
            },
            "properties": {
                "index": "2"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6682, 45.5261]
            },
            "properties": {
                "index": "3"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6652, 45.5268]
            },
            "properties": {
                "index": "1"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6682, 45.5272]
            },
            "properties": {
                "index": "2"
            }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [-122.6678, 45.5252]
            },
            "properties": {
                "index": "5"
            }
        }]
    };*/
    var GeoJsonPoints = data.geoJson;
    var greenMarker = lmap.icon({
        iconSize: [15, 15],
        color: '#7FFF00'
    });
    var yellowMarker = lmap.icon({
        iconSize: [15, 15],
        color: '#EEC900'
    });
    var orangeMarker = lmap.icon({
        iconSize: [15, 15],
        color: '#EE9A00'
    });
    var brownMarker = lmap.icon({
        iconSize: [15, 15],
        color: '#D2691E'
    });
    var redMarker = lmap.icon({
        iconSize: [15, 15],
        color: '#CD0000'
    });

    var pointMarkerOption = null;

    var pointLayer;

    function aaaa() {
        alert('1');
    }

    function panTotarget(e) {
        if (map.getZoom() <= 16) {
            map.setZoomAround(e.target._latlng, 17);
        } else map.panTo(e.target._latlng);

        var popup1 = L.popup().setContent(
            '<button class="aa">档案</button>' +
            '<button class="aa">实时</button>' +
            '<button class="aa">更新</button>');

        pointLayer.bindPopup(popup1)
            .addTo(map);
    };

    function highlightFeature(e) {
        var highlighticon = lmap.icon({
            iconSize: [25, 25],
            color: e.target.defaultOptions.icon.options.color
        });
        e.target.setIcon(highlighticon);
        /*L.popup({
            offset: [0, -8],
            closeButton: false
        }).setLatLng(e.target._latlng).setContent(e.target.feature.properties.name).openOn(map);*/
    };

    function resetFeature(e) {
        var reseticon = lmap.icon({
            iconSize: [15, 15],
            color: e.target.defaultOptions.icon.options.color
        });
        e.target.setIcon(reseticon);
        //map.closePopup();
    };

    function eachPointFeature(feature, layer) {
        layer.on({
            click: panTotarget,
            mouseover: highlightFeature,
            mouseout: resetFeature
        });
    };
    pointLayer = L.geoJson(GeoJsonPoints, {
        pointToLayer: function(feature, latlng) {
            var indexVal = feature.properties.index;
            if (indexVal > 0 && indexVal <= 2) pointMarkerOption = greenMarker;
            else if (indexVal > 2 && indexVal <= 4) pointMarkerOption = yellowMarker;
            else if (indexVal > 4 && indexVal <= 6) pointMarkerOption = orangeMarker;
            else if (indexVal > 6 && indexVal <= 8) pointMarkerOption = brownMarker;
            else if (indexVal > 8) pointMarkerOption = redMarker;

            return L.marker(latlng, {
                icon: pointMarkerOption
            });
        },
        onEachFeature: eachPointFeature

    }).addTo(map);



};
const roadLayer = function(data) {

    map.eachLayer((layer) => {
        if (layer.options.id != 'roadLayer' && layer.options.id != 'streetLayer')
            map.removeLayer(layer);
    });
    /*这个GeoJsonLines是需要后台请求的*/
    /*var GeoJsonLines = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-122.6672, 45.5254],
                    [-122.6572, 45.5254],
                    [-122.6672, 45.5354]
                ]
            },
            "properties": { "index": 1 }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-122.6311, 45.4354],
                    [-122.6844, 45.4133],
                    [-122.6722, 45.4321],
                    [-122.6611, 45.4211]
                ]
            },
            "properties": { "index": 2 }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-122.6222, 45.4354],
                    [-122.6811, 45.4511],
                    [-122.6672, 45.5354],
                    [-122.6652, 45.5654],
                    [-122.6431, 45.5422]
                ]
            },
            "properties": { "index": 3 }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-122.6122, 45.4454],
                    [-122.6411, 45.4311],
                    [-122.6572, 45.5654],
                    [-122.6652, 45.5254],
                    [-122.6731, 45.5122]
                ]
            },
            "properties": { "index": 4 }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [-122.6222, 45.5354],
                    [-122.6611, 45.5111],
                    [-122.6682, 45.5354],
                    [-122.6452, 45.5554],
                    [-122.6451, 45.5522]
                ]
            },
            "properties": { "index": 5 }
        }]
    };*/

    var GeoJsonLines = data.geoJson;
    var greenLine = {
        "color": "#7FFF00",
        "weight": 9,
        "opacity": 0.8
    };
    var yellowLine = {
        "color": "#FFEB00",
        "weight": 9,
        "opacity": 0.8
    };
    var orangeLine = {
        "color": "#FFA500",
        "weight": 9,
        "opacity": 0.8
    };
    var brownLine = {
        "color": "#CD3333",
        "weight": 9,
        "opacity": 0.8
    };

    var redLine = {
        "color": "#FF0000",
        "weight": 9,
        "opacity": 0.8
    };
    var lineLayer;

    function panToBound(e) {
        //console.log(e.target);
        map.fitBounds(e.target.getBounds());

    };

    function highlightFeature(e) {
        var l = e.target;
        l.setStyle({
            weight: 9,
            color: '#007D7D',
            dashArray: '',
            fillOpacity: 0.9
        });
    };

    function resetFeature(e) {
        lineLayer.resetStyle(e.target);
    };

    function eachLineFeature(feature, layer) {
        layer.on({
            click: panToBound,
            mouseover: highlightFeature,
            mouseout: resetFeature
        });
    };


    lineLayer = L.geoJson(GeoJsonLines, {
        style: function(feature) {
            var indexVal = feature.properties.index;
            if (indexVal <= 2) return greenLine;
            else if (indexVal > 2 && indexVal <= 4) return yellowLine;
            else if (indexVal > 4 && indexVal <= 6) return orangeLine;
            else if (indexVal > 6 && indexVal <= 8) return brownLine;
            else if (indexVal > 8) return redLine;
        },
        onEachFeature: eachLineFeature
    }).addTo(map);

    /* var popup2 = L.popup().setContent('<button  >1</button');
     lineLayer.bindPopup(popup2).addTo(map);*/
};

const areaLayer = function(data) {
    map.eachLayer((layer) => {
        if (layer.options.id != 'areaLayer' && layer.options.id != 'streetLayer')
            map.removeLayer(layer);
    });
    console.log(data);

    var GeoJsonRegion = data.geoJson;
    /*这个GeoJsonRegion是需要后台请求的*/
    /*var GeoJsonRegion = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {
                "type": "point",
                "coordinates": [
                    [
                        [-122.6311, 45.4354],
                        [-122.6844, 45.4133],
                        [-122.6722, 45.4321],
                        [-122.6611, 45.4211]
                    ]
                ]
            },
            "properties": {}
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-122.6211, 45.4354],
                        [-122.6244, 45.4333],
                        [-122.6222, 45.4321],
                        [-122.6211, 45.4311]
                    ]
                ]
            },
            "properties": { "index": 2 }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Linestring",
                "coordinates": [
                    [
                        [-122.6411, 45.4454],
                        [-122.6444, 45.4433],
                        [-122.6422, 45.4421],
                        [-122.6411, 45.4411]
                    ]
                ]
            },
            "properties": { "index": 3 }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-122.6511, 45.4554],
                        [-122.6544, 45.4533],
                        [-122.6522, 45.4521],
                        [-122.6511, 45.4511]
                    ]
                ]
            },
            "properties": { "index": 4 }
        }, {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-122.6811, 45.4854],
                        [-122.6844, 45.4833],
                        [-122.6822, 45.4821],
                        [-122.6811, 45.4811]
                    ]
                ]
            },
            "properties": { "index": 5 }
        }]
    };*/
    var greenRegion = {
        fillColor: "#7FFF00",
        fillOpacity: 1,
        color: "#fff",
        weight: 5,
        opacity: 0.8
    };
    var yellowRegion = {
        fillColor: "#FFEB00",
        fillOpacity: 1,
        color: "#fff",
        weight: 5,
        opacity: 0.8

    };
    var orangeRegion = {
        fillColor: "#FFA500",
        fillOpacity: 1,
        color: "#fff",
        weight: 5,
        opacity: 0.8

    };
    var brownRegion = {
        fillColor: "#CD3333",
        fillOpacity: 1,
        color: "#fff",
        weight: 5,
        opacity: 0.8
    };

    var redRegion = {
        fillColor: "#FF0000",
        fillOpacity: 1,
        color: "#fff",
        weight: 5,
        opacity: 0.8

    };
    var regionLayer;

    function panToBound(e) {
        map.fitBounds(e.target.getBounds());
    };

    function highlightFeature(e) {
        var l = e.target;
        l.setStyle({
            weight: 5,
            color: '#007D7D',
            dashArray: '',
            fillOpacity: 0.9
        });
    };

    function resetFeature(e) {
        regionLayer.resetStyle(e.target);
    };

    function eachRegionFeature(feature, layer) {
        layer.on({
            click: panToBound,
            mouseover: highlightFeature,
            mouseout: resetFeature
        });
    };


    regionLayer = L.geoJson(GeoJsonRegion, {
        style: function(feature) {
            var indexVal = feature.properties.index;
            if (indexVal <= 2) return greenRegion;
            else if (indexVal > 2 && indexVal <= 4) return yellowRegion;
            else if (indexVal > 4 && indexVal <= 6) return orangeRegion;
            else if (indexVal > 6 && indexVal <= 8) return brownRegion;
            else if (indexVal > 8) return redRegion;
        },
        onEachFeature: eachRegionFeature
    });
    var popup3 = L.popup().setContent("hello, this is a popup REGION");
    regionLayer.bindPopup(popup3).addTo(map);

};


export const playback = (a) => {


    let markerPlayBack = lmap.geoTime(a, {
        map: map,
        duration: 1000
    });
    return markerPlayBack;
};


const DataService = (api_path, param, a, b) => {
    window.$.ajax({
        type: 'POST',
        url: 'http://10.25.67.121:8080/trafficIndex_web' + api_path,
        data: param,
        dataType: 'json',
        async: false,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        success: a,
        error: b
    });
};
export const displayUniLayer = (ref) => {
    console.log(ref)
    map.eachLayer((layer) => {
        if (layer.options.id !== "streetLayer") {
            map.removeLayer(layer);
        }
    });
    var param = null,
        _APIpath = null,
        featurecollectiondata = null,
        specialpointlayer = null,
        specialstyle = null;


    if (ref == 'fudongche') {
        _APIpath = "/map/floatCar.json";
        var fudongcheIcon = L.icon({
            iconUrl: '../src/images/local_taxi.png',
            iconSize: [20, 20], // size of the icon
            iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
            popupAnchor: [20, 0] // point from which the popup should open relative to the iconAnchor
        });
        specialpointlayer = (feature, latlng) => {
            //var indexVal = feature.properties.index;
            return L.marker(latlng, {
                icon: fudongcheIcon
            });
        }
    } else if (ref == 'shigong') {
        _APIpath = "/map/roadConstruction.json";
        specialstyle = (feature) => {
            return {
                fillColor: '#007D7D',
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }
    } else if (ref == 'guanzhi') {
        _APIpath = "/map/trafficControl.json";
        specialstyle = (feature) => {
            return {
                fillColor: '#EEC900',
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }
    } else if (ref == 'shigu') {
        _APIpath = "/map/trafficAccident.json";
        specialstyle = (feature) => {
            return {
                fillColor: '#D2691E',
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }
    }

    DataService(_APIpath, param, (resp) => {
        console.log(resp.data);
        featurecollectiondata = resp.data;
    }, (e) => {
        console.log(e);
        alert("后台传输错误");
    });

    function panToBound(e) {
        var eachFeatureID = e.target.feature.properties.id;
        var sendparamID = {
            "id": eachFeatureID
        };
        console.log(sendparamID);
        DataService("", sendparamID, (resp) => {
            console.log(resp)
        }, (e) => {
            console.log(e)
        });
        console.log(e.target);

        var specialpopup = L.popup().setContent("这是浮动车信息");
        SpecificLayer.bindPopup(specialpopup).addTo(map);

        if (specialpointlayer) {
            if (map.getZoom() <= 16) {
                map.setZoomAround(e.target._latlng, 17);
            } else map.panTo(e.target._latlng);
        } else map.fitBounds(e.target.getBounds());

    };

    function eachUniFeature(feature, layer) {
        layer.on({
            click: panToBound,
            //mouseover: highlightFeature,
            //mouseout: resetFeature
        });
    };
    var SpecificLayer = L.geoJson(featurecollectiondata, {
        style: specialstyle,
        pointToLayer: specialpointlayer,
        onEachFeature: eachUniFeature
    });
    map.addLayer(SpecificLayer);

}