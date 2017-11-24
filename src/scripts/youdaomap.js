import L from 'leaflet';
import LE from 'esri-leaflet';
import * as lmap from '../libs/lmap';
import * as lmsg from '../libs/lmsg';
import * as Ds from '../libs/DataService';
import lrDraw123 from './lrDraw123';
import turf from '@turf/turf';
import leaflet_draw from 'leaflet-draw';

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
				color1 = 'f66';
			e.target.setStyle({
				fillColor: color1,
				fillOpacity: 1,
				color: color1,
				weight: 7,
				opacity: 1
			});
		}
		console.log('sending', e.target.feature.properties.id, e.target.feature.properties.name)
		lmsg.send('selectFhld', {
			roadId: e.target.feature.properties.id,
			name: e.target.feature.properties.name
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
	/*let myoptions = {
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
		myLocation.stop()
	});*/

	let MyCustomMarker = L.Icon.extend({
		options: {
			shadowUrl: null,
			iconAnchor: new L.Point(8, 35),
			iconSize: new L.Point(20, 40),
			iconUrl: './images/pin_location.svg'
		}
	});
	let myLocation = new L.FeatureGroup();
	map.addLayer(myLocation);

	let drawControl = new L.Control.Draw({
		edit: false,
		draw: {
			polyline: false,
			polygon: false,
			rectangle: false,
			marker: {
				icon: new MyCustomMarker()
			},
			circle: false
		},
		position: 'topright'
	});
	map.addControl(drawControl);
	map.on('draw:created', (e) => {
		let layer = e.layer;
		lmsg.send('selectPoint', {
			point: [layer._latlng.lng, layer._latlng.lat]
		});
		console.log('transfer to screen 1', [layer._latlng.lng, layer._latlng.lat]);
		myLocation.addLayer(layer);
		map.removeEventListener('draw:created');
		map.removeControl(drawControl);
	});

}

export const initLayer = () => {
	Ds.DataService('/guidance_mapSearch/map_dwxxInit.do', null, (resp) => {
		let geojson = resp.aaData.jsonMap;
		displayDeviceLayer(geojson);
	}, (e) => {
		message.error('传输错误');
		console.log('传输错误');
	});
}

//展示所有点
export const displayDeviceLayer = (data) => {

	map.eachLayer((layer) => {
		if (layer.options.id != 'streetLayer')
			map.removeLayer(layer);
	});

	const GeoJsonPoints = data;

	const defaultMarker = lmap.icon({
		iconSize: [15, 15],
		color: '#2db7f5'
	});



	$(document).on('click', '#peizhi', () => {
		lmsg.send('toPeizhi', {});
	}).on('click', '#bianji', () => {
		lmsg.send('toBianji', {});
	}).on('click', '#jiankong', () => {
		lmsg.send('toJiankong', {
			ydpxh: $('#popContainer').attr('data-ydp')
		});
	});

	map.on('popupopen', () => {


	}).on('popupclose', () => {
		if (ydpInterval) {
			clearInterval(ydpInterval);
		}
	});

	var ydpInterval;

	function panTotarget(e) {
		/*	if (map.getZoom() <= _mapConfig.panToZoomLevel - 1) {
				map.setZoomAround(e.target._latlng, _mapConfig.panToZoomLevel);
			} else map.panTo(e.target._latlng);*/


		ydpInterval = undefined;

		let ydpXh = e.target.feature.properties.id;
		let popupContainer = '<div id="popContainer" data-ydp="' + ydpXh + '""></div>';
		pointLayer.bindPopup(popupContainer, {
				'className': 'ydDevicePop'
			})
			.addTo(map);
		//简单解决方法，但实际上应该用on.popupopen
		setTimeout(() => {
			$('#popContainer').html('');
			//加按钮
			let buttonGroup = $('<div>').addClass('ydpcontainer123').html('<button id="peizhi" class="ydswitchBtn">屏配置</button><button id="bianji" class="ydswitchBtn">节目单编辑</button><button id="jiankong" class="ydswitchBtn">诱导屏监控</button><button class="ydswitchBtn">logo</button>');
			$('#popContainer').addClass('text-center').append(buttonGroup).append($('<div>').addClass('container2'));
			//请求svg内容
			Ds.DataService('/guidance_ydpMonitor/gotoSingleScreenContent.do', {
				id: $('#popContainer').attr('data-ydp') //e.target.feature.properties.id
			}, (resp) => {
				const svgList = resp.aaData;
				if (svgList) {
					if (svgList.svgType == 0) {
						$('.container2').html(svgList.svg);
					} else if (svgList.svgType == 1) {
						let wznr = JSON.parse(svgList.svg),
							alignCss = null;

						switch (wznr.dqfs) {
							case "middle":
								alignCss = 'text-center';
								break;
							case "start":
								alignCss = 'text-left';
								break;
							case "end":
								alignCss = 'text-right';
								break;
							default:
								alignCss = 'text-center';
								break;
						}
						var mySvg = $('<div>').css({
							'color': wznr.ys,
							'font-size': wznr.dx + 'px',
							'font-family': wznr.zt,
							'padding-top': '130px'
						}).addClass(alignCss).html(wznr.nr);
						$('.container2').html(mySvg);
					} else if (svgList.svgType == -1) {
						$('.container2').html($('<div>').css({
							'color': 'red',
							'padding-top': '150px'
						}).text(svgList.svg));
					}
				} else return;
			}, (e) => {
				console.log(e);
			});

			ydpInterval = setInterval(() => {
				$('#popContainer').html('');
				let buttonGroup = $('<div>').addClass('ydpcontainer123').html('<button id="peizhi" class="ydswitchBtn">屏配置</button><button id="bianji" class="ydswitchBtn">节目单编辑</button><button id="jiankong" class="ydswitchBtn">诱导屏监控</button><button class="ydswitchBtn">logo</button>');
				$('#popContainer').addClass('text-center').append(buttonGroup).append($('<div>').addClass('container2'));
				Ds.DataService('/guidance_ydpMonitor/gotoSingleScreenContent.do', {
					id: $('#popContainer').attr('data-ydp')
				}, (resp) => {
					const svgList = resp.aaData;
					if (svgList) {
						if (svgList.svgType == 0) {
							$('.container2').html(svgList.svg);
						} else if (svgList.svgType == 1) {
							let wznr = JSON.parse(svgList.svg),
								alignCss = null;

							switch (wznr.dqfs) {
								case "middle":
									alignCss = 'text-center';
									break;
								case "start":
									alignCss = 'text-left';
									break;
								case "end":
									alignCss = 'text-right';
									break;
								default:
									alignCss = 'text-center';
									break;
							}
							var mySvg = $('<div>').css({
								'color': wznr.ys,
								'font-size': wznr.dx + 'px',
								'font-family': wznr.zt,
								'padding-top': '130px'
							}).addClass(alignCss).html(wznr.nr);
							$('.container2').html(mySvg);
						} else if (svgList.svgType == -1) {
							$('.container2').html($('<div>').css({
								'color': 'red',
								'padding-top': '150px'
							}).text(svgList.svg));
						}
					} else return;
				}, (e) => {
					console.log(e);
				});
			}, 20000);
		}, 200);
	};

	function highlightFeature(e) {
		var highlighticon = lmap.icon({
			iconSize: [25, 25],
			color: '#418bc9'
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
			color: '#2db7f5'
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
	var pointLayer = L.geoJson(GeoJsonPoints, {
		pointToLayer: function(feature, latlng) {
			return L.marker(latlng, {
				icon: defaultMarker
			});
		},
		onEachFeature: eachPointFeature

	}).addTo(map);


}

export const clearLayer = () => {
	map.eachLayer((layer) => {
		if (layer.options.id !== 'streetLayer')
			map.removeLayer(layer);
	});
}

export const querySingleMonitor = (id) => {
	map.eachLayer((layer) => {
		if (layer._content) {
			if (layer._content.id == id) {
				layer._content.parentNode.parentNode.style.borderStyle = 'solid';
				layer._content.parentNode.parentNode.style.borderColor = '#f26687';
			}
		}
		if (layer.feature) {
			if (layer.feature.geometry.type == 'Point' && layer.feature.properties.id == id) {
				if (layer.feature.properties.type !== 1) {

					layer.setIcon(lmap.icon({
						iconSize: [30, 30],
						color: '#f66'
					}));
				} else layer.setIcon(lmap.icon({
					iconSize: [15, 15],
					color: '#2db7f5'
				}));
			}
		}

	});
}