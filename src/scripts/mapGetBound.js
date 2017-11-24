import L from 'leaflet';

export const mapBoundControl = {
	getBound: () => {
		mapGetCurrentBound();
	},
	zoomToBound: (e, zoom) => {
		mapZoomToBound(e, zoom);
	},
	panToBound: (e) => {
		mapPanInsideBound(e);
	}
}

const mapGetCurrentBound = () => {
	let TR = [map.getBounds()._northEast.lat, map.getBounds()._northEast.lng];
	let BL = [map.getBounds()._southWest.lat, map.getBounds()._southWest.lng];
	let CurrentBound = [BL, TR];
	return CurrentBound;
}

const mapZoomToBound = (e, zoom) => {
	let currentBound = e;
	if (!!!e) {
		alert('no bound selected');
		return;
	} else {
		map.fitBounds(e, {
			maxZoom: zoom
		});
	}
}
const mapPanInsideBound = (e) => {
	let currentBound = e;
	if (!!!e) {
		alert('no bound selected');
		return;
	} else {
		map.panInsideBounds(e);
	}
}