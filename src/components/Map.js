import React from 'react'
import { RENDERING_CLUSTERS, RENDERING_HEATMAP, RENDERING_MARKERS, RENDERING_POLYLINE } from "./constants";
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

/*
 * Main map component based on leaflet map.
 */
export const Map = React.memo(({layers}) => {

	const mapRef = React.useRef();
	const mapElementRef = React.createRef();

	const mapOverlaysRef = React.useRef({});
	const layerControlRef = React.useRef(new L.control.layers([]));

	const renderedBounds = React.useRef(new L.LatLngBounds());

	React.useEffect(() => {
		const mapElement = mapElementRef.current;

		if (mapElement) {
			mapRef.current = L.map(mapElement, {
				preferCanvas: true,
				center: [0, 0],
				zoom: 2,
				layers: [
					L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
						attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					}),
				]
			});
		}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	React.useEffect(() => {
		const map = mapRef.current;
		const layerControl = layerControlRef.current;

		if (map) {
			let mapBounds = new L.LatLngBounds();

			// On a new render pass, build new map overlays object,
			// and replace the current map overlays object created on the last render pass
			const newMapOverlays = {}
			const currentMapOverlays  = mapOverlaysRef.current;

			layers.forEach((layer) => {
				const {name, bounds, rendering, data, radius, color } = layer;

				const layerBounds = new L.LatLngBounds(bounds);

				if (layerBounds.isValid()) {
					mapBounds.extend(layerBounds);
				}

				const rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

				switch(rendering) {
					case RENDERING_MARKERS:
						let markerLayer = currentMapOverlays[name];

						if (!markerLayer) {
							markerLayer = L.layerGroup().addTo(map);
						}

						// TODO: check if the layer has changed before rerendering it
						markerLayer.clearLayers();

						data.forEach(entry => {
							const m = L.circleMarker(
								entry.pos,
								{
									title: entry.tooltip,
									fill: true,
									radius: 5,
									color: rgbColor,
									fillColor: rgbColor,
									opacity: color.a,
									fillOpacity: color.a
								}
							).addTo(markerLayer);

							if (entry.tooltip !== undefined) {
								m.bindPopup(entry.tooltip);
							}
						});

						newMapOverlays[name] = markerLayer;

						break;

					case RENDERING_POLYLINE:
						let polylineLayer = currentMapOverlays[name];

						if (!polylineLayer) {
							polylineLayer = L.polyline([], {color: rgbColor}).addTo(map);
						}

						// TODO: check if the layer has changed before rerendering it
						polylineLayer.setLatLngs(data.map(entry => entry.pos));

						newMapOverlays[name] = polylineLayer;

						break;

					case RENDERING_HEATMAP:
						let heatmapLayer = currentMapOverlays[name];

						if (!heatmapLayer) {
							heatmapLayer = L.heatLayer([], {
								radius,
								minOpacity: 0.1,
								blur: 15,
								max: 10.0
							}).addTo(map);
						}

						// TODO: check if the layer has changed before rerendering it
						data.forEach((entry) => {
							heatmapLayer.addLatLng(entry.pos.concat(1.0));
						});

						newMapOverlays[name] = heatmapLayer;

						break;

					case RENDERING_CLUSTERS:
						let clusterLayer = currentMapOverlays[name];

						if (!clusterLayer) {
							clusterLayer = L.markerClusterGroup().addTo(map);
						}

						// TODO: check if the layer has changed before rerendering it
						clusterLayer.clearLayers();

						data.forEach(entry => {
							const m = L.circleMarker(entry.pos,{
								title: entry.tooltip,
								fill: true,
								radius: 5,
								color: rgbColor,
								fillColor: rgbColor,
								opacity: color.a,
								fillOpacity: color.a
							}).addTo(clusterLayer);

							if (entry.tooltip !== undefined) {
								m.bindPopup(entry.tooltip);
							}
						});

						newMapOverlays[name] = clusterLayer;

						break;
					default:
						break;
				}
			});

			// Remove deleted layers from the map and the layer control
			try {
				for (const [name, overlay] of Object.entries(currentMapOverlays)) {
					if (!newMapOverlays[name]) {
						map.removeLayer(overlay);
						layerControl.remove(overlay);
					}
				}
			} catch (error) {
				console.log(error)
			}

			// Persist overlays for the next render pass
			mapOverlaysRef.current = newMapOverlays;

			// Zoom to bounds if different
			if (mapBounds.isValid() && !mapBounds.equals(renderedBounds.current)) {
				map.flyToBounds(mapBounds);
				renderedBounds.current = mapBounds;
			}

		}
	}, [layers]);

	return (
		<div id="map" ref={mapElementRef} />
	);
});
