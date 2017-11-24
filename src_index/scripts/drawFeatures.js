import L from 'leaflet';
import turf from '@turf/turf';
import leaflet_draw from 'leaflet-draw';
import * as lmsg from '../libs/lmsg';

export const drawFeatures = {
	activate: function() {
		activateDrawToolbar();
	},
	disable: function() {
		stopDrawToolbar();
	}
}

var drawnItemsLayer1 = null,
	drawnItemsLayer2 = null,
	drawnItemsLayer3 = null,
	drawnItemsLayer4 = null,
	drawnItemsLayer5 = null,
	drawControl = null,
	NewRoadfeature = null,
	NewRegionfeature = null,
	NewFhldfeature = null,
	NewODRegionfeature = null,
	ODDataRec = null,
	regionDataRec = null,
	pointsWithin_OD = null,
	pointIDWithin_OD = [],
	pointsWithin_Region = null,
	pointIDWithin_Region = [],
	roadWithin_Region = null,
	roadIDWithin_Region = [],
	totalIdWithin_Region = {},
	doublerIds = [],
	drawHolidayRegionLayer = null,
	drawHolidayRegionLayer2 = null,
	drawHolidayRegionLayer3 = null,
	holidayRoadSelectRegion = null,
	holidayRoadSelectIds = [],
	CenterPoint_OD = null;

let MyCustomMarker = L.Icon.extend({
	options: {
		shadowUrl: null,
		iconAnchor: new L.Point(8, 35),
		iconSize: new L.Point(20, 40),
		iconUrl: _imagePath + '/pin_location2.png'
	}
});
L.drawLocal = {
	draw: {
		toolbar: {
			// #TODO: this should be reorganized where actions are nested in actions
			// ex: actions.undo  or actions.cancel
			actions: {
				title: 'Cancel drawing',
				text: '取消'
			},
			finish: {
				title: 'Finish drawing',
				text: '完成'
			},
			undo: {
				title: 'Delete last point drawn',
				text: '撤销'
			},
			buttons: {
				polyline: '绘制线',
				polygon: '绘制多边形',
				rectangle: '绘制矩形',
				circle: 'Draw a circle',
				marker: '绘制点'
			}
		},
		handlers: {
			circle: {
				tooltip: {
					start: 'Click and drag to draw circle.'
				},
				radius: 'Radius'
			},
			marker: {
				tooltip: {
					start: '点击地图标注一个点'
				}
			},
			polygon: {
				tooltip: {
					start: '点击开始绘制多边形',
					cont: '继续点击，继续绘制',
					end: '双击来结束绘制'
				}
			},
			polyline: {
				error: '<strong>Error:</strong> 不能重叠，重叠了',
				tooltip: {
					start: '点击开始绘制线',
					cont: '继续点击，继续绘制',
					end: '双击来结束绘制'
				}
			},
			rectangle: {
				tooltip: {
					start: '长按来绘制一个矩形'
				}
			},
			simpleshape: {
				tooltip: {
					end: '释放鼠标按键来结束绘制'
				}
			}
		}
	},
	edit: {
		toolbar: {
			actions: {
				save: {
					title: 'Save changes.',
					text: '保存'
				},
				cancel: {
					title: 'Cancel editing, discards all changes.',
					text: '取消'
				}
			},
			buttons: {
				edit: '编辑图形',
				editDisabled: '没有可编辑的图形',
				remove: '删除图形',
				removeDisabled: '没有可删除的图形'
			}
		},
		handlers: {
			edit: {
				tooltip: {
					text: '拖拽节点来编辑图形',
					subtext: '单击节点取消编辑'
				}
			},
			remove: {
				tooltip: {
					text: '选择想要删除的图形'
				}
			}
		}
	}
};
const activateDrawToolbar = function() {
	drawnItemsLayer1 = null;

	var drawnItemsLayer12 = new L.FeatureGroup();
	map.addLayer(drawnItemsLayer12);

	drawControl = new L.Control.Draw({
		edit: {
			featureGroup: drawnItemsLayer12,
			remove: true
		},
		draw: {
			polyline: {
				allowIntersection: false,
				drawError: {
					color: '#e1e100',
					message: '<strong>STOP<strong>重叠了'
				},
				shapeOptions: {
					color: '#f357a1',
					weight: 8
				}
			},
			polygon: {
				metric: true,
				allowIntersection: false,
				drawError: {
					color: '#b00b00',
					timeout: 1000,
					message: '<strong>STOP<strong>重叠了'
				},
				shapeOptions: {
					color: '#00f6ff',
					stroke: true,
					weight: '6',
					fill: '#00f6ff'
				},
				showArea: true
			},
			rectangle: {
				shapeOptions: {
					color: '#f50'
				},
				showArea: true
			},
			marker: {
				icon: new MyCustomMarker()
			},
			circle: false
		},
		position: 'topright'
	});
	map.addControl(drawControl);
	map.on('draw:created', (e) => {

		let type = e.layerType;
		let layer = e.layer;
		var latlngs = [],
			coords = null,
			featureDrawn = null,
			measurement = null;
		if (type == 'polyline') {
			layer._latlngs.map((item) => {
				coords = [item.lng, item.lat];
				latlngs.push(coords);
			});
			featureDrawn = turf.lineString(latlngs);
			measurement = turf.lineDistance(featureDrawn, "kilometers");

		} else if (type == 'polygon' || type == 'rectangle') {
			layer._latlngs[0].map((item) => {
				coords = [item.lng, item.lat];
				latlngs.push(coords);
			});
			//第一个点和最后一个点要保持一致，要不turf解析不了。
			latlngs.push(latlngs[0])
			featureDrawn = turf.polygon([latlngs]);
			//面积是平方公里
			measurement = turf.area(featureDrawn) / 1000000;

		} else if (type == "circle") {} else if (type == "marker") {
			latlngs = [layer._latlng.lng, layer._latlng.lat];
			measurement = latlngs;
			featureDrawn = turf.point(latlngs);
		} else {
			alert("创建图形失败");
			return;
		}
		//传给1屏的,不包括后台
		if (measurement && featureDrawn) {
			console.log('transfer to screen 1');
			lmsg.send('jtgz', {
				finish: true,
				params: {
					geometry: featureDrawn,
					measurement: measurement
				}
			});
			lmsg.send('jtsg', {
				finish: true,
				params: {
					geometry: featureDrawn,
					measurement: measurement
				}
			});
			lmsg.send('dlsg', {
				finish: true,
				params: {
					geometry: featureDrawn,
					measurement: measurement
				}
			});
		}
		drawnItemsLayer12.addLayer(layer);
		//map.removeEventListener('draw:created');
	});
}



const stopDrawToolbar = () => {
	/*	map.eachLayer((layer) => {
			if (layer.options.id != 'streetLayer')
				map.removeLayer(layer);
		});*/
	if (drawControl) map.removeControl(drawControl);
	drawControl = null;
	map.removeEventListener('draw:created');
	map.removeEventListener('draw:edited');
	map.removeEventListener('draw:deleted');
}

export const DrawConfigLayer = {
	DrawRoad: {
		activate: function() {
			DrawConfigLayer_road();

		},
		getValue: function() {
			return NewRoadfeature;
		}
	},
	DrawRegion: {
		activate: function() {
			DrawConfigLayer_region();
		},
		getValue: function() {
			return NewRegionfeature
		},
		dataRecv: function(dataRec) {
			regionDataRec = dataRec;
		},
		calculateWithin: function() {
			CalculateWithin_Region();
			return totalIdWithin_Region
		}
	},
	DrawOD: {
		activate: function() {
			DrawConfigLayer_ODregion();
		},
		getValue: function() {
			return NewODRegionfeature
		},
		dataRecv: function(dataRec) {
			ODDataRec = dataRec;
		},
		calculateWithin: function() {
			CalculateWithin_OD();
			return pointIDWithin_OD;
		},
		calculateCenterPoint: function() {
			CalculateCenterPoint_OD();
			return CenterPoint_OD;
		}
	},
	DrawFhld: {
		activate: function(doublersData) {
			drawFhld(doublersData);
		},
		getValue: function() {
			return NewFhldfeature
		},
		getDoublerIds: function() {
			return doublerIds
		}
	}
}

const DrawConfigLayer_road = () => {
	NewFhldfeature = null;
	stopDrawToolbar();
	drawnItemsLayer2 = null;
	drawnItemsLayer2 = new L.FeatureGroup();
	map.addLayer(drawnItemsLayer2);
	drawControl = new L.Control.Draw({
		edit: {
			featureGroup: drawnItemsLayer2,
			//remove: false
		},
		draw: {
			polyline: {
				allowIntersection: false,
				drawError: {
					color: '#e1e100',
					message: '<strong>STOP<strong>重叠了'
				},
				shapeOptions: {
					color: '#f357a1',
					weight: 8
				}
			},
			polygon: false,
			rectangle: false,
			marker: false,
			circle: false
		},
		position: 'topright'
	});
	map.addControl(drawControl);
	var latlngs = [],
		coords = null;

	map.on('draw:created', function(e) {
		var type = e.layerType,
			layer = e.layer;
		layer._latlngs.map((item) => {
			coords = [item.lng, item.lat];
			latlngs.push(coords);
		});
		NewRoadfeature = turf.lineString(latlngs);
		drawnItemsLayer2.addLayer(layer);
		map.removeEventListener('draw:created');
	});
	map.on('draw:edited', function(e) {
		for (var item in e.layers._layers) {
			e.layers._layers[item]._latlngs.map((item) => {
				coords = [item.lng, item.lat];
				latlngs.push(coords);
				NewRoadfeature = turf.lineString(latlngs);
			});
		}
		map.removeEventListener('draw:edited');
	});
	map.on('draw:deleted', function(e) {
		NewRoadfeature = null;
		map.removeEventListener('draw:deleted');
	});
}

const DrawConfigLayer_region = () => {
	NewFhldfeature = null;
	stopDrawToolbar();
	drawnItemsLayer3 = null;
	drawnItemsLayer3 = new L.FeatureGroup();
	map.addLayer(drawnItemsLayer3);
	drawControl = new L.Control.Draw({
		edit: {
			featureGroup: drawnItemsLayer3,
			//remove: false
		},
		draw: {
			polyline: false,
			polygon: {
				metric: true,
				allowIntersection: false,
				drawError: {
					color: '#b00b00',
					timeout: 1000,
					message: '<strong>STOP<strong>重叠了'
				},
				shapeOptions: {
					color: '#00f6ff',
					stroke: true,
					weight: '6',
					fill: '#00f6ff'
				}
				//showArea: true
			},
			rectangle: {
				shapeOptions: {
					color: '#f50'
				},
				showArea: true
			},
			marker: false
				/*{
								icon: new MyCustomMarker()
							}*/
				,
			circle: false
		},
		position: 'topright'
	});
	map.addControl(drawControl);
	var latlngs = [],
		coords = null;
	map.on('draw:created', function(e) {
		var type = e.layerType,
			layer = e.layer;
		layer._latlngs[0].map((item) => {
			coords = [item.lng, item.lat];
			latlngs.push(coords);
		});
		//第一个点和最后一个点要保持一致，要不turf解析不了。
		latlngs.push(latlngs[0])
		NewRegionfeature = turf.polygon([latlngs]);
		drawnItemsLayer3.addLayer(layer);
		map.removeEventListener('draw:created');
	});
	map.on('draw:edited', function(e) {
		for (var id in e.layers._layers) {
			e.layers._layers[id]._latlngs[0].map((item) => {
				coords = [item.lng, item.lat];
				latlngs.push(coords);
			});
		}
		//第一个点和最后一个点要保持一致，要不turf解析不了。
		latlngs.push(latlngs[0])
		NewRegionfeature = turf.polygon([latlngs]);
		map.removeEventListener('draw:edited');
	});
	map.on('draw:deleted', function(e) {
		NewRegionfeature = null;
		map.removeEventListener('draw:deleted');
	});
}

const DrawConfigLayer_ODregion = () => {
	NewFhldfeature = null;
	stopDrawToolbar();
	drawnItemsLayer4 = null;
	drawnItemsLayer4 = new L.FeatureGroup();
	map.addLayer(drawnItemsLayer4);
	drawControl = new L.Control.Draw({
		edit: {
			featureGroup: drawnItemsLayer4,
			//remove: false
		},
		draw: {
			polyline: false,
			polygon: {
				metric: true,
				allowIntersection: false,
				drawError: {
					color: '#b00b00',
					timeout: 1000,
					message: '<strong>STOP<strong>重叠了'
				},
				shapeOptions: {
					color: '#00f6ff',
					stroke: true,
					weight: '6',
					fill: '#00f6ff'
				}
				//showArea: true
			},
			rectangle: {
				shapeOptions: {
					color: '#f50'
				},
				showArea: true
			},
			marker: false
				/*{
								icon: new MyCustomMarker()
							}*/
				,
			circle: false
		},
		position: 'topright'
	});
	map.addControl(drawControl);
	var latlngs = [],
		coords = null;
	map.on('draw:created', function(e) {
		var type = e.layerType,
			layer = e.layer;
		layer._latlngs[0].map((item) => {
			coords = [item.lng, item.lat];
			latlngs.push(coords);
		});
		//第一个点和最后一个点要保持一致，要不turf解析不了。
		latlngs.push(latlngs[0])
		NewODRegionfeature = turf.polygon([latlngs]);
		drawnItemsLayer4.addLayer(layer);
		//map.removeEventListener('draw:created');
	});
	map.on('draw:edited', function(e) {
		for (var id in e.layers._layers) {
			e.layers._layers[id]._latlngs[0].map((item) => {
				coords = [item.lng, item.lat];
				latlngs.push(coords);
			});
		}
		//第一个点和最后一个点要保持一致，要不turf解析不了。
		latlngs.push(latlngs[0])
		NewODRegionfeature = turf.polygon([latlngs]);
		//map.removeEventListener('draw:edited');
	});
	map.on('draw:deleted', function(e) {
		NewODRegionfeature = null;
		//map.removeEventListener('draw:deleted');
	});
}

const CalculateWithin_Region = () => {
	if (regionDataRec && NewRegionfeature) {
		var CrossPointLayer = regionDataRec.cross;
		var RoadLineLayer = regionDataRec.road;

		var regionFC = {
			"type": "FeatureCollection",
			"features": [NewRegionfeature]
		};
		var features = [];
		RoadLineLayer.features.map(
			(oneLine) => {
				var theID = oneLine.properties.id;
				oneLine.geometry.coordinates.map((singleLine) => {
					singleLine.map((oneCoords) => {
						var onePoint = {
							"type": "Feature",
							"properties": {
								'id': theID
							},
							"geometry": {
								"type": "Point",
								"coordinates": oneCoords
							}
						};
						features.push(onePoint);
					});

				});
			}
		);

		var fc_Points_FromRoad = turf.featureCollection(features);
		roadWithin_Region = turf.within(fc_Points_FromRoad, regionFC);
		//pointsWithin_Region 是包含的点console.log(pointsWithin_Region);
		//提取出所有的id
		var IDresultsroad_region = [];
		roadWithin_Region.features.map((p1) => {
			IDresultsroad_region.push(p1.properties.id);
		});
		//IDresultsroad_region现在是带重复的,去重复
		var hash = {};
		for (var i = 0; i < IDresultsroad_region.length; i++) {
			if (!hash[IDresultsroad_region[i]]) {
				hash[IDresultsroad_region[i]] = true;
				roadIDWithin_Region.push(IDresultsroad_region[i]);
			}
		};
		pointsWithin_Region = turf.within(CrossPointLayer, regionFC);
		pointsWithin_Region.features.map((p1) => {
			pointIDWithin_Region.push(p1.properties.id);
		});
		totalIdWithin_Region = {
			roadIds: roadIDWithin_Region,
			crossIds: pointIDWithin_Region
		};
	} else
		totalIdWithin_Region = null;

}

const CalculateWithin_OD = () => {
	if (NewODRegionfeature) {
		var CrossPointLayer = ODDataRec.cross;
		//这里得拼接成FeatureCollection
		var odregionFC = {
			"type": "FeatureCollection",
			"features": [NewODRegionfeature]
		};
		pointsWithin_OD = turf.within(CrossPointLayer, odregionFC);
		pointsWithin_OD.features.map((p1) => {
			pointIDWithin_OD.push(p1.properties.id);
		});
	} else return pointIDWithin_OD = null;
}
const CalculateCenterPoint_OD = () => {
	if (NewODRegionfeature) {
		var centroid = turf.centroid(NewODRegionfeature);
		CenterPoint_OD = centroid.geometry.coordinates;
	} else return CenterPoint_OD = null;

}

const drawFhld = (doublersData) => {
	NewFhldfeature = null;
	doublerIds = [];
	stopDrawToolbar();
	var drawnItemsLayer5 = null;
	drawnItemsLayer5 = new L.FeatureGroup();
	map.addLayer(drawnItemsLayer5);
	drawControl = new L.Control.Draw({
		edit: {
			featureGroup: drawnItemsLayer5,
			//remove: false
		},
		draw: {
			polyline: {
				allowIntersection: false,
				drawError: {
					color: '#e1e100',
					message: '<strong>STOP<strong>重叠了'
				},
				shapeOptions: {
					color: '#f357a1',
					weight: 8
				}
			},
			polygon: false,
			rectangle: false,
			marker: false,
			circle: false
		},
		position: 'topright'
	});
	map.addControl(drawControl);
	var latlngs = [],
		coords = null;
	map.on('draw:created', function(e) {
		var type = e.layerType,
			layer = e.layer;
		layer._latlngs.map((item) => {
			coords = [item.lng, item.lat];
			latlngs.push(coords);
		});
		NewFhldfeature = turf.lineString(latlngs);
		drawnItemsLayer5.addLayer(layer);
		if (NewFhldfeature) {
			var bufferedFhld = turf.buffer(NewFhldfeature, 50, 'meters')
			var bufferFC = {
				"type": "FeatureCollection",
				"features": [bufferedFhld]
			};
			L.geoJson(bufferFC, {
				style: function(feature) {
					return {
						color: 'red'
					};
				}
			}).addTo(map);
			var features = [];
			doublersData.features.map(
				(oneLine) => {
					var theID = oneLine.properties.id;
					var theName = oneLine.properties.name;
					if (oneLine.geometry) {
						oneLine.geometry.coordinates.map((oneCoords) => {
							var onePoint = {
								"type": "Feature",
								"properties": {
									'id': theID,
									'name': theName
								},
								"geometry": {
									"type": "Point",
									"coordinates": oneCoords
								}
							};
							features.push(onePoint);
						});
					}

				});

			var fc_Points_FromRoad = turf.featureCollection(features);
			var pointsWithin_fhld = turf.within(fc_Points_FromRoad, bufferFC);
			var doublersID_all = [];
			pointsWithin_fhld.features.map((p1) => {
				doublersID_all.push({
					'id': p1.properties.id,
					'name': p1.properties.name
				});
			});
			//doublersID_all现在是带重复的,去重复
			var hash = {};
			for (var i = 0; i < doublersID_all.length; i++) {
				if (!hash[doublersID_all[i].id]) {
					hash[doublersID_all[i].id] = true;
					doublerIds.push({
						'id': doublersID_all[i].id,
						'name': doublersID_all[i].name
					});
				}
			};
			var measurement = turf.lineDistance(NewFhldfeature, 'meters');
			lmsg.send('fhld_ok', {
				new_fhld: NewFhldfeature,
				doublers: doublerIds,
				measurement: measurement
			});
			console.log({
				new_fhld: NewFhldfeature,
				doublers: doublerIds,
				measurement: measurement
			})
			console.log('fhld_ok sent to screen 1', doublerIds);
		}
		map.removeControl(drawControl);
		map.removeEventListener('draw:created');
	});

}
var newHolidayRegion = null;
export const DrawHoliday = {
	drawRegion: () => {
		drawHolidayRegion();
	},
	selectRoad: (data) => {
		holiday_selectRoad(data);
	},
	selectCross: (data) => {
		holiday_selectCross(data);
	}

}

const drawHolidayRegion = () => {
	newHolidayRegion = null;
	drawControl = null;
	stopDrawToolbar();
	var drawHolidayRegionLayer = null;
	drawHolidayRegionLayer = new L.FeatureGroup();
	map.addLayer(drawHolidayRegionLayer);
	drawControl = new L.Control.Draw({
		edit: {
			featureGroup: drawHolidayRegionLayer,
			//remove: false
		},
		draw: {
			polyline: false,
			polygon: {
				metric: true,
				allowIntersection: false,
				drawError: {
					color: '#b00b00',
					timeout: 1000,
					message: '<strong>STOP<strong>重叠了'
				},
				shapeOptions: {
					color: '#00f6ff',
					stroke: true,
					weight: '6',
					fill: '#00f6ff'
				}
				//showArea: true
			},
			rectangle: {
				shapeOptions: {
					color: '#f50'
				},
				showArea: true
			},
			marker: {
				icon: new MyCustomMarker()
			},
			circle: false
		},
		position: 'topright'
	});
	map.addControl(drawControl);
	var latlngs = [],
		coords = null;
	map.on('draw:created', function(e) {
		var type = e.layerType,
			layer = e.layer;

		drawHolidayRegionLayer.addLayer(layer);
		layer._latlngs[0].map((item) => {
			coords = [item.lng, item.lat];
			latlngs.push(coords);
		});
		//第一个点和最后一个点要保持一致，要不turf解析不了。
		latlngs.push(latlngs[0])
		newHolidayRegion = turf.polygon([latlngs]);
		if (newHolidayRegion) {
			lmsg.send('hbjjrB', {
				type: 1,
				params: newHolidayRegion
			});
		}
		console.log('newHolidayRegion send to HBjj', newHolidayRegion);
		map.removeControl(drawControl);
		map.removeEventListener('draw:created');
	});

}


const holiday_selectRoad = (roadData) => {
	var fhldData = roadData;
	holidayRoadSelectRegion = null;
	drawControl = null;
	stopDrawToolbar();
	var drawHolidayRegionLayer2 = null;
	drawHolidayRegionLayer2 = new L.FeatureGroup();
	map.addLayer(drawHolidayRegionLayer2);
	drawControl = new L.Control.Draw({
		edit: {
			featureGroup: drawHolidayRegionLayer2,
			//remove: false
		},
		draw: {
			polyline: false,
			polygon: {
				metric: true,
				allowIntersection: false,
				drawError: {
					color: '#b00b00',
					timeout: 1000,
					message: '<strong>STOP<strong>重叠了'
				},
				shapeOptions: {
					color: '#00f6ff',
					stroke: true,
					weight: '6',
					fill: '#00f6ff'
				}
				//showArea: true
			},
			rectangle: {
				shapeOptions: {
					color: '#f50'
				},
				showArea: true
			},
			marker: false,
			circle: false
		},
		position: 'topright'
	});
	map.addControl(drawControl);
	var latlngs = [],
		coords = null;
	map.on('draw:created', function(e) {
		var type = e.layerType,
			layer = e.layer;

		drawHolidayRegionLayer2.addLayer(layer);
		layer._latlngs[0].map((item) => {
			coords = [item.lng, item.lat];
			latlngs.push(coords);
		});
		//第一个点和最后一个点要保持一致，要不turf解析不了。
		latlngs.push(latlngs[0])
		holidayRoadSelectRegion = turf.polygon([latlngs]);
		var fc_holidayRoadSelectRegion = {
			"type": "FeatureCollection",
			"features": [holidayRoadSelectRegion]
		};
		var features = [];
		fhldData.features.map(
			(oneLine) => {
				var theID = oneLine.properties.id;
				var theName = oneLine.properties.name;
				if (oneLine.geometry) {

					oneLine.geometry.coordinates.map((singleLine) => {
						singleLine.map((oneCoords) => {
							var onePoint = {
								"type": "Feature",
								"properties": {
									'id': theID,
									'name': theName
								},
								"geometry": {
									"type": "Point",
									"coordinates": oneCoords
								}
							};
							features.push(onePoint);
						});


					});
				}

			});
		var fc_Points_FromRoad = turf.featureCollection(features);
		var pointsWithin_fhld = turf.within(fc_Points_FromRoad, fc_holidayRoadSelectRegion);
		//提取出所有的id
		//doublerIds = [];
		var idnameAll = [];
		pointsWithin_fhld.features.map((p1) => {
			idnameAll.push({
				'id': p1.properties.id,
				'name': p1.properties.name
			});
		});
		var hash = {};
		for (var i = 0; i < idnameAll.length; i++) {
			if (!hash[idnameAll[i].id]) {
				hash[idnameAll[i].id] = true;
				holidayRoadSelectIds.push({
					'id': idnameAll[i].id,
					'name': idnameAll[i].name
				});
			}
		};
		lmsg.send('hbjjrB', {
			type: 3,
			params: holidayRoadSelectIds
		});
		console.log('newHolidayRegion send to HBjj', holidayRoadSelectIds);
		map.removeControl(drawControl);
		map.removeEventListener('draw:created');
	});
}

const holiday_selectCross = (crossData) => {
	var crossData_fc = crossData;
	holidayRoadSelectRegion = null;
	drawControl = null;
	stopDrawToolbar();
	var drawHolidayRegionLayer3 = null;
	drawHolidayRegionLayer3 = new L.FeatureGroup();
	map.addLayer(drawHolidayRegionLayer3);
	drawControl = new L.Control.Draw({
		edit: {
			featureGroup: drawHolidayRegionLayer3,
			//remove: false
		},
		draw: {
			polyline: false,
			polygon: {
				metric: true,
				allowIntersection: false,
				drawError: {
					color: '#b00b00',
					timeout: 1000,
					message: '<strong>STOP<strong>重叠了'
				},
				shapeOptions: {
					color: '#00f6ff',
					stroke: true,
					weight: '6',
					fill: '#00f6ff'
				}
				//showArea: true
			},
			rectangle: {
				shapeOptions: {
					color: '#f50'
				},
				showArea: true
			},
			marker: false,
			circle: false
		},
		position: 'topright'
	});
	map.addControl(drawControl);
	var latlngs = [],
		coords = null;

	map.on('draw:created', function(e) {
		var type = e.layerType,
			layer = e.layer;

		drawHolidayRegionLayer3.addLayer(layer);
		layer._latlngs[0].map((item) => {
			coords = [item.lng, item.lat];
			latlngs.push(coords);
		});
		//第一个点和最后一个点要保持一致，要不turf解析不了。
		latlngs.push(latlngs[0])
		holidayRoadSelectRegion = turf.polygon([latlngs]);
		var fc_holidayRoadSelectRegion = {
			"type": "FeatureCollection",
			"features": [holidayRoadSelectRegion]
		};
		var pointsWithin_Region = turf.within(crossData_fc, fc_holidayRoadSelectRegion);
		var holidayCrossWithin = [];
		pointsWithin_Region.features.map((p1) => {
			holidayCrossWithin.push({
				id: p1.properties.id,
				name: p1.properties.name
			});
		});
		lmsg.send('hbjjrB', {
			type: 2,
			params: holidayCrossWithin
		});
		console.log('holidayCrossWithin send to HBjj', holidayCrossWithin);
		map.removeControl(drawControl);
		map.removeEventListener('draw:created');
	});
}

var carparkLocLayer = null,
	carParkCoords = null;

export const carParkLocating = () => {
	carparkLocLayer = null;
	carparkLocLayer = new L.FeatureGroup();
	map.addLayer(carparkLocLayer);

	drawControl = new L.Control.Draw({
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
		lmsg.send('carpark_end', {
			coordinates: [e.layer._latlng.lng, e.layer._latlng.lat]
		});
		console.log('transfer to screen 1', [e.layer._latlng.lng, e.layer._latlng.lat]);
		carparkLocLayer.addLayer(layer);
		map.removeEventListener('draw:created');
		map.removeControl(drawControl);
	});
}