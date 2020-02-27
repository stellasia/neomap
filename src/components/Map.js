import React, {Component} from 'react'
import {FeatureGroup, LayersControl, Map as LeafletMap, CircleMarker, Polyline, TileLayer, Popup} from 'react-leaflet'
import HeatmapLayer from 'react-leaflet-heatmap-layer';


class Map extends Component {

	constructor(props) {
		super(props);

		this.renderMarkerLayer = this.renderMarkerLayer.bind(this);
		this.renderHeatmapLayer = this.renderHeatmapLayer.bind(this);
		this.renderClusterLayer = this.renderClusterLayer.bind(this);
		this.onFeatureGroupAdd = this.onFeatureGroupAdd.bind(this);
	};


	renderMarker(d, j, color, opacity) {
		/*Render maker with optional tooltip
         */
		if (d.tooltip) {
			return (
				<CircleMarker key={j}
							  center={d.pos}
							  radius={5}
							  color={color}
							  fill={true}
							  fillColor={color}
							  fillOpacity={opacity}
				>
					<Popup>{d.tooltip}</Popup>
				</CircleMarker>
			)
		}
		return (
			<CircleMarker key={j}
						  center={d.pos}
						  radius={5}
						  color={color}
						  fill={true}
						  fillColor={color}
						  fillOpacity={opacity}
			>
			</CircleMarker>
		)
	};


	renderMarkerLayer(layer) {
		/*Will show one marker per items in `layer.data`
         */
		let data = layer.data;
		let color = `rgb(${layer.color.r}, ${layer.color.g}, ${layer.color.b})`;
		let opacity = layer.color.a;

		return (
			<LayersControl.Overlay key={layer.ukey} name={layer.name} checked>
				<FeatureGroup onAdd={this.onFeatureGroupAdd}>
					{
						data.map((d, j) => {
							return this.renderMarker(d, j, color, opacity);
						})
					}
				</FeatureGroup>
			</LayersControl.Overlay>
		);
	};


	renderHeatmapLayer(layer) {
		/* Create heatmap based on items in `layer.data`, each with weight 1.
         */
		let data = layer.data;
		return (
			<LayersControl.Overlay key={layer.ukey} name={layer.name} checked>
				<HeatmapLayer
					fitBoundsOnLoad
					points={data}
					latitudeExtractor={m => m.pos[0]}
					longitudeExtractor={m => m.pos[1]}
					intensityExtractor={() => 1}
					radius={layer.radius}
					minOpacity={0.1}
					max={10}
				/>
			</LayersControl.Overlay>
		);
	};


	renderClusterLayer() {
		/*TODO: cluster layer
         */
		return "Cluster layer not supported for now";
	};


	renderPolylineLayer(layer) {
		/*Will show one marker per items in `layer.data`
         */
		let data = layer.data;
		let color = layer.color;
		let positions = [];
		data.forEach(el => {
			positions.push(el.pos);
		});
		return (
			<LayersControl.Overlay key={layer.ukey} name={layer.name} checked>
				<FeatureGroup onAdd={this.onFeatureGroupAdd}>
					<Polyline color={color} positions={positions} />
				</FeatureGroup>
			</LayersControl.Overlay>
		);
	};


	onFeatureGroupAdd(e) {
		if (e.target.getBounds()._northEast !== undefined)
			this.refs.map.leafletElement.fitBounds(e.target.getBounds());
	};


	render() {
		let layers = Object.entries(this.props.layers);

		/*Map center will be the one of the last layer...
           TODO: compute zoom or use leaflet tools to set it automatically?
         */

		let center = [47, 3];
		let zoom = 4;

		return (
			<LeafletMap center={center} zoom={zoom} ref="map" preferCanvas={true} >
				<LayersControl>
					<LayersControl.BaseLayer name="Base" checked>
						<TileLayer
							attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
					</LayersControl.BaseLayer>
					{
						layers.map(([, layer]) => {
							if (layer.ukey !== undefined) {
								if (layer.rendering === "polyline")
									return this.renderPolylineLayer(layer);
								if (layer.rendering === "markers")
									return this.renderMarkerLayer(layer);
								if (layer.rendering === "heatmap")
									return this.renderHeatmapLayer(layer);
								if (layer.rendering === "clusters")
									return this.renderClusterLayer();
								return "";
							}
							return "";
						})
					}
				</LayersControl>
			</LeafletMap>
		)
	}
}


export default  Map;
