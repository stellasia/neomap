/**
 * NB: this component has been designed in order to redraw existing layers
 * but we are not yet able to detect changes (in rendering type or color)
 * and hence we are still redrawing all layers at each rendering.
 * To be improved.
 */
import React from 'react'
import { RENDERING_CLUSTERS, RENDERING_HEATMAP, RENDERING_MARKERS, RENDERING_POLYLINE, RENDERING_RELATIONS } from "./constants";
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet-polylinedecorator';
import initGeoman from './Geoman';

/*
 * Main map component based on leaflet map.
 */
export const Map = React.memo(({layers, sideBarCollapsed}) => {

	const mapRef = React.useRef();
	const mapElementRef = React.createRef();

	const mapOverlaysRef = React.useRef({});
	const layerControlRef = React.useRef(new L.control.layers([]));

	const renderedBounds = React.useRef(new L.LatLngBounds());

	React.useEffect(() => {
		const map = mapRef.current;
		if (map) {
			map.invalidateSize();
		}
	}, [sideBarCollapsed]);

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

			initGeoman(map);

			// On a new render pass, build new map overlays object,
			// and replace the current map overlays object created on the last render pass
			const newMapOverlays = {}
			const currentMapOverlays  = mapOverlaysRef.current;

			layers.forEach((layer) => {
				const { bounds, rendering, data, radius, color, relationshipColor, ukey } = layer;

				console.log(data);

				const layerBounds = new L.LatLngBounds(bounds);

				if (layerBounds.isValid()) {
					mapBounds.extend(layerBounds);
				}

				// TODO: check if the layer has changed before rerendering it
				const currentOverlay = currentMapOverlays[ukey]
				if (currentOverlay) {
					map.removeLayer(currentOverlay);
					layerControl.removeLayer(currentOverlay);
				}

				const rgbColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
				const relRgbColor = `rgb(${relationshipColor.r}, ${relationshipColor.g}, ${relationshipColor.b})`;

				switch(rendering) {
					case RENDERING_MARKERS:
						const markerLayer = L.layerGroup().addTo(map);
					
						// TODO: check if the layer has changed before rerendering it
						markerLayer.clearLayers();

						data.forEach(entry => {
							const m = L.circleMarker(
								entry.pos,
								{
									title: entry.tooltip,
									fill: true,
									radius: 3,
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

						newMapOverlays[ukey] = markerLayer;

						break;

					case RENDERING_RELATIONS:
						const arrow = [
							{
								offset: "50%",
								repeat: 0,
								symbol: L.Symbol.arrowHead({
									pixelSize: 10,
									polygon: false,
									pathOptions: { stroke: true }
								})
							}
						];

						const relationsLayer = L.layerGroup().addTo(map);

						// TODO: check if the layer has changed before rerendering it
						relationsLayer.clearLayers();
						
						const showDirections = localStorage.getItem("show_directions") === "true";
						data.forEach(entry => {
							const polyline = L.polyline([entry.start, entry.end], {color: relRgbColor, opacity: relationshipColor.a}).addTo(relationsLayer)

							if (entry.tooltip != null) {
								polyline.bindPopup(entry.tooltip);
							}
							if (showDirections) {
								const arrowheads = L.polylineDecorator(polyline, {
									patterns: arrow,
								})
								arrowheads.addTo(relationsLayer);
							}
						});

						newMapOverlays[ukey] = relationsLayer;
						break;

					case RENDERING_POLYLINE:
						let polylineLayer = L.polyline([], {color: rgbColor}).addTo(map);
						polylineLayer.setLatLngs(data.map(entry => entry.pos));

						newMapOverlays[ukey] = polylineLayer;

						break;

					case RENDERING_HEATMAP:
						let heatmapLayer = L.heatLayer([], {
							radius,
							minOpacity: 0.1,
							blur: 15,
							max: 10.0
						}).addTo(map);

						data.forEach((entry) => {
							heatmapLayer.addLatLng(entry.pos.concat(1.0));
						});

						newMapOverlays[ukey] = heatmapLayer;

						break;

					case RENDERING_CLUSTERS:
						let clusterLayer = L.markerClusterGroup().addTo(map);
						// clusterLayer.clearLayers();

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

						newMapOverlays[ukey] = clusterLayer;

						break;
					default:
						break;
				}

				layerControl.addOverlay(newMapOverlays[ukey], ukey);

			});

			// Remove deleted layers from the map and the layer control
			try {
				for (const [_ukey, overlay] of Object.entries(currentMapOverlays)) {
					if (!newMapOverlays[_ukey]) {
						map.removeLayer(overlay);
						layerControl.removeLayer(overlay);
					}
				}
			} catch (error) {
				console.error(error)
			}

			layerControl.addTo(map);

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
