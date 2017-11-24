import L from 'leaflet';
import turf from '@turf/turf';
import leaflet_draw from 'leaflet-draw';
//import pinImg from './images/pin_location.svg';

const lrDraw123 = class drawFeature {
	constructor(Map, options) {
		this._map = Map,
			this.drawControl = null,
			this.featureCollection = {
				"type": "FeatureCollection",
				"features": []
			},
			this.feature = {
				point: null,
				polyline: null,
				polygon: null,
				//rectangle: null,
			}
			//this.start = this._start || {};
			//this.stop = this._stop || {};
		let myOptions = {
			polyline: {
				show: true,
				color: '#f357a1',
				weight: 8,
				allowIntersection: false
			},
			polygon: {
				show: true,
				color: '#007edf',
				allowIntersection: false
			},
			rectangle: {
				show: true,
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
				url: './assets/images/pin_location.svg',
				show: true
			}
		};
		for (let obj in options) {
			for (let i in options[obj]) {
				myOptions[obj][i] = options[obj][i];
			}
		}
		this._options = myOptions;

	}
	start() {
		const _map = this._map;
		let self = this;
		this.feature = {
			point: null,
			polyline: null,
			polygon: null,
		};
		this.featureCollection = {
			"type": "FeatureCollection",
			"features": []
		};
		let _drawControl = this.drawControl;
		let MyCustomMarker = L.Icon.extend({
			options: {
				shadowUrl: null,
				iconAnchor: new L.Point(25, 73),
				iconSize: new L.Point(50, 100),
				iconUrl: this._options.marker.url
			}
		});
		L.drawLocal = {
			draw: {
				toolbar: {
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
		let editableLayers = new L.FeatureGroup();
		_map.addLayer(editableLayers);

		_drawControl = new L.Control.Draw({
			position: 'topright',
			draw: {
				polyline: this._options.polyline.show ? {
					shapeOptions: {
						color: this._options.polyline.color,
						weight: this._options.polyline.weight
					},
					allowIntersection: this._options.polyline.allowIntersection
				} : false,
				polygon: this._options.polygon.show ? {
					allowIntersection: this._options.polygon.allowIntersection,
					drawError: {
						color: '#e1e100',
						message: '<strong>重叠<strong>不可重叠'
					},
					shapeOptions: {
						color: this._options.polygon.color
					}
				} : false,
				circle: this._options.circle.show ? {
					allowIntersection: this._options.circle.allowIntersection,
					drawError: {
						color: '#e1e100',
						message: '<strong>重叠<strong>不可重叠'
					},
					shapeOptions: {
						color: this._options.circle.color
					},
					repeatMode: this._options.circle.repeat
				} : false,
				rectangle: this._options.rectangle.show ? {
					allowIntersection: this._options.rectangle.allowIntersection,
					drawError: {
						color: '#e1e100',
						message: '<strong>重叠<strong>不可重叠'
					},
					shapeOptions: {
						color: this._options.rectangle.color
					},
					repeatMode: this._options.rectangle.repeat
				} : false,
				marker: this._options.marker.show ? {
					icon: new MyCustomMarker()
				} : false
			},
			edit: this._options.circle.show || this._options.polyline.show || this._options.rectangle.show || this._options.marker.show || this._options.polygon.show ? {
				featureGroup: editableLayers,
				remove: true,
				poly: {
					allowIntersection: this._options.polygon.allowIntersection
				}
			} : false
		});
		this.drawControl = _drawControl;
		_map.addControl(_drawControl);
		_map.on('draw:created', function(e) {
			let type = e.layerType,
				layer = e.layer;
			editableLayers.addLayer(layer);
			let leafletID = e.layer._leaflet_id;
			if (type === 'polyline') {
				let coords = [];
				layer._latlngs.map(item => coords.push([item.lng, item.lat]));
				self.feature.polyline = {
					"type": "Feature",
					"geometry": {
						"type": "LineString",
						"coordinates": coords
					},
					"properties": {
						"leafletID": leafletID
					}
				};
				self.featureCollection.features.push(self.feature.polyline);
			} else if (type === 'polygon' || type === 'rectangle') {
				let coords = [];
				layer._latlngs[0].map(item => coords.push([item.lng, item.lat]));
				self.feature.polygon = {
					"type": "Feature",
					"geometry": {
						"type": "Polygon",
						"coordinates": [
							coords
						]
					},
					"properties": {
						"leafletID": leafletID
					}
				};
				self.featureCollection.features.push(self.feature.polygon);
			} else if (type === 'marker') {
				self.feature.point = {
					"type": "Feature",
					"geometry": {
						"type": "Point",
						"coordinates": [layer._latlng.lng, layer._latlng.lat]
					},
					"properties": {
						"leafletID": leafletID
					}
				};
				self.featureCollection.features.push(self.feature.point);
			}
		});
		_map.on('draw:edited', function(e) {
			var hasEdited = false;
			for (let i in e.layers._layers) {
				hasEdited = true;
			}
			var newFeatures = [];
			if (hasEdited) {
				newFeatures = [];
				e.layers.eachLayer((layer) => {
					let leafletID = layer._leaflet_id;
					self.featureCollection.features.map((eachLayer) => {
						if (eachLayer.properties.leafletID === layer._leaflet_id) {
							if (eachLayer.geometry.type === 'Point') {
								let nf = {
									"type": "Feature",
									"geometry": {
										"type": "Point",
										"coordinates": [layer._latlng.lng, layer._latlng.lat]
									},
									"properties": {
										"leafletID": leafletID
									}
								};
								newFeatures.push(nf);
								self.feature.point = nf;
							} else if (eachLayer.geometry.type === 'Polygon') {
								let coords = [];
								layer._latlngs[0].map(item => coords.push([item.lng, item.lat]));
								let nf = {
									"type": "Feature",
									"geometry": {
										"type": "Polygon",
										"coordinates": [
											coords
										]
									},
									"properties": {
										"leafletID": leafletID
									}
								};
								newFeatures.push(nf);
								self.feature.polygon = nf;

							} else if (eachLayer.geometry.type === 'LineString') {
								let coords = [];
								layer._latlngs.map(item => coords.push([item.lng, item.lat]));
								let nf = {
									"type": "Feature",
									"geometry": {
										"type": "LineString",
										"coordinates": coords
									},
									"properties": {
										"leafletID": leafletID
									}
								};
								newFeatures.push(nf);
								self.feature.polyline = nf;
							}
						}
					});
				});
				var oldFeature = self.featureCollection.features;
				for (let i = 0; i < oldFeature.length; i++) {
					for (let o = 0; o < newFeatures.length; o++) {
						if (oldFeature[i].properties.leafletID === newFeatures[o].properties.leafletID) {
							oldFeature.splice(i, 1);
						}
					}
				}
				oldFeature = oldFeature.concat(newFeatures);
				self.featureCollection.features = oldFeature;
			} else
				self.featureCollection = self.featureCollection;
		});
		_map.on('draw:deleted', function(e) {
			var hasdelete = false;
			for (let i in e.layers._layers) {
				hasdelete = true;
			}
			var ids = [];
			if (hasdelete) {
				for (var id in e.layers._layers) {
					ids.push(id);
				}
				var oldFeature = self.featureCollection.features;
				for (let i = 0; i < oldFeature.length; i++) {
					for (let o = 0; o < ids.length; o++) {
						if (oldFeature[i].properties.leafletID === ids[o] * 1) {
							oldFeature.splice(i, 1);
						}
					}
				}
				self.featureCollection.features = oldFeature;

			} else
				self.featureCollection = self.featureCollection;
		});
	}
	stop() {
		let map = this._map;
		map.eachLayer((layer) => {
			if (layer.options.id != 'streetLayer')
				map.removeLayer(layer);
		});
		if (this.drawControl) map.removeControl(this.drawControl);
		this.drawControl = null;
		this.feature = {
			point: null,
			polyline: null,
			polygon: null,
		};
		this.featureCollection = {
			"type": "FeatureCollection",
			"features": []
		};
		map.removeEventListener('draw:created');
		map.removeEventListener('draw:edited');
		map.removeEventListener('draw:deleted');
	}
	getFeature() {
		return this.feature;
	}
	getFeatureCollection() {
		return this.featureCollection;
	}
	getArea(feature) {
		let area = turf.area(feature);
		return area;
	}
	getLength(feature) {
		let linedistance = turf.lineDistance(feature, 'kilometers');
		return linedistance;
	}
	getCenter(feature) {
		var f = null;
		if (feature.type === 'FeatureCollection') {
			console.warn('使用了featureCollection,不建议');
		}
		let centroidPt = turf.centroid(feature);
		return centroidPt;
	}


}


export default lrDraw123