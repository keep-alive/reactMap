import L from 'leaflet';
import LE from 'esri-leaflet';
import * as lmap from '../libs/lmap';
import * as lmsg from '../libs/lmsg';
import * as Ds from '../libs/DataService';
import lrDraw123 from './lrDraw123';

export const showFhld = (mydata) => {
	map.eachLayer((layer) => {
		if (layer.options.id !== "streetLayer") {
			map.removeLayer(layer);
		}
	});

	var ChangeLayerData = mydata;
	var onClickLayer = (e) => {

		if (e.target.options.color !== '#696969') {
			e.target.setStyle({
				weight: 7,
				color: '#696969',
				dashArray: '',
				fillOpacity: 0.9
			});
		} else {
			var color1;
			if (e.target.feature.properties.rgb)
				color1 = 'rgba(' + e.target.feature.properties.rgb + ')';
			else
				color1 = 'LightSalmon';
			e.target.setStyle({
				fillColor: color1,
				fillOpacity: 1,
				color: color1,
				weight: 7,
				opacity: 1
			});
		}
		console.log('sending', e.target.feature.properties.id)
		lmsg.send('selectFhld', {
			roadId: e.target.feature.properties.id
		});

	}
	var showName = (e) => {
		var popup = L.popup().setContent('名称：' + e.target.feature.properties.name);
		e.target.bindPopup(popup, {
			offset: [0, -30]
		}).openPopup();
	}
	var closePopup = (e) => {
		//ChangeConfigLayer.resetStyle(e.target);
		e.target.closePopup();
	}
	var ChangeConfigLayer = L.geoJson(ChangeLayerData, {
		style: function(feature) {
			var color1 = null;
			if (feature.properties.rgb) {
				color1 = 'rgba(' + feature.properties.rgb + ')';
			} else
				color1 = 'LightSalmon';
			var styles = {
				fillColor: color1,
				fillOpacity: 1,
				color: color1,
				weight: 7,
				opacity: 1
			};
			return styles;
		},
		onEachFeature: (feature, layer) => {
			layer.on({
				click: onClickLayer,
				mouseover: showName,
				mouseout: closePopup
			});
		}
	}).addTo(map);
}

export const locatePoint = () => {
	let myoptions = {


		polyline: {
			show: false,
			color: '#f357a1',
			weight: 8,
			allowIntersection: false
		},
		polygon: {
			show: false,
			color: '#007edf',
			allowIntersection: false
		},
		rectangle: {
			show: false,
			color: '#bada55',
			allowIntersection: false,
			repeat: false
		},
		circle: {
			show: false,
			color: '#333333',
			allowIntersection: false,
			repeat: false
		},
		marker: {
			url: './images/pin_location.svg',
			show: true
		}

	}
	let myLocation = new lrDraw123(map, myoptions);

	myLocation.start();
	map.on('draw:created', (e) => {
		let ydpoint = myLocation.getFeature().point.geometry.coordinates;
		console.log('sending point coordinates', ydpoint);
		lmsg.send('selectPoint', {
			point: ydpoint
		})
	});


}