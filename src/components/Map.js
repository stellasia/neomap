import React from 'react'
import {RENDERING_CLUSTERS, RENDERING_HEATMAP, RENDERING_MARKERS, RENDERING_POLYLINE} from "./Layer";
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

	}, [mapElementRef]);

	React.useEffect(() => {
		const map = mapRef.current;

		if (map) {

			layerControlRef.current.remove(map);

			let globalBounds = new L.LatLngBounds();

			
			// On a new render pass, build new map overlays object,
			// and replace the current map overlays object. This auto-removes
			// any deleted layers from map
			const newMapOverlays = {}
			const currentmapOverlays  = mapOverlaysRef.current;

			// Iterate through layers
			layers.forEach((layer) => {
				const {ukey, name, bounds, rendering, data, radius, color } = layer;

				if (ukey === undefined) {
					return;
				}

				const latLngBounds = new L.LatLngBounds(bounds);

				if (latLngBounds.isValid()) {
					globalBounds.extend(latLngBounds);
				}

				const rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

				switch(rendering) {
					case RENDERING_MARKERS:
						let markerLayer = currentmapOverlays[name];

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
						let polylineLayer = currentmapOverlays[name];

						if (!polylineLayer) {
							polylineLayer = L.polyline([], {color: rgbColor}).addTo(map);
						}

						// TODO: check if the layer has changed before rerendering it
						polylineLayer.setLatLngs([]);

						data.forEach((entry) => {
							polylineLayer.addLatLng(entry.pos);
						});

						newMapOverlays[name] = polylineLayer;

						break;

					case RENDERING_HEATMAP:
						let heatmapLayer = currentmapOverlays[name];

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
						let clusterLayer = currentmapOverlays[name];

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

			// Check if globalBounds is defined
			if (!globalBounds.isValid()) {
				globalBounds = new L.LatLngBounds([[90, -180], [-90, 180]]);
			}
	
			map.flyToBounds(globalBounds);
	
			const layerControl = L.control.layers([], newMapOverlays).addTo(map);

			layerControlRef.current = layerControl;
			mapOverlaysRef.current = newMapOverlays;
		}
	}, [layers]);

	return (
		<div id="map" ref={mapElementRef} />
	);
});
