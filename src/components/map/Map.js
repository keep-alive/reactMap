import React from 'react';
import L from 'leaflet';
import LE from 'esri-leaflet';
import * as LDraw from 'leaflet-draw';

class Map extends React.Component {
    constructor() {
        super();
    }
    componentWillReceiveProps(nextProps) {
        // var searchVal = this.props.searchVal;
        // console.log(nextProps.searchVal);
        // console.log(map)
        // LE.featureLayer({
        //     url: 'https://services.arcgis.com/rOo16HdIMeOBI4Mb/arcgis/rest/services/Heritage_Trees_Portland/FeatureServer/0'
        // }).addTo(map)
    }
    render() {
        return (<div id="map"></div>)
    }
    componentDidMount() {
        var map = L.map("map", {
            center: _mapConfig.center,
            zoom: _mapConfig.defaultZoom,
            minZoom: _mapConfig.minZoom,
            maxZoom: _mapConfig.maxZoom,
            drawControl: false,
            zoomControl: false,
            maxBounds: L.latLngBounds(L.latLng(_mapConfig.bounds.minx, _mapConfig.bounds.miny), L.latLng(_mapConfig.bounds.maxx, _mapConfig.bounds.maxy)),

            //visualClick: false,


        });
        L.esri.tiledMapLayer({
            id: 'streetLayer',
            url: _mapserverUrl.streetLayer,
            //errorTileUrl: _imagePath + '/errorTile.png'
        }).addTo(map);

        window.map = map;
    }
}

export default Map