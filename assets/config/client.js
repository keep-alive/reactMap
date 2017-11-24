var _mapConfig = {
		center: [28.2, 121.369], //中心点121.3695, 28.2565
		defaultZoom: 12, //默认zoom
		maxZoom: 18, //最大
		minZoom: 2, //最小
		panToZoomLevel: 16, //点击点放大的zoom
		bounds: {
			miny: 121.2074,
			minx: 28.0744,
			maxy: 121.6633,
			maxx: 28.5126
		}
	}
	/*var _initMap_global = {
	    center: [31.3, 120.55],
	    defaultZoom: 12,
	    minZoom: 1,
	    maxZoom: 18,
	    bounds: {
	        minx: 0,
	        miny: -180,
	        maxx: 90,
	        maxy: 180
	    }
	}*/

var _mapserverUrl = {
	streetLayer: 'http://cache1.arcgisonline.cn/ArcGIS/rest/services/ChinaOnlineStreetColor/MapServer'
};
var _DataService = 'http://localhost:8080/JDT';

var _imagePath = _DataService + '/map/images';