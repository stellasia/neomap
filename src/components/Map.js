import React, {Component} from 'react'
import L from 'leaflet';

class Map extends Component {

	constructor(props) {
		super(props);

		this.renderMarkerLayer = this.renderMarkerLayer.bind(this);
		this.renderHeatmapLayer = this.renderHeatmapLayer.bind(this);
		this.renderClusterLayer = this.renderClusterLayer.bind(this);
	};

	componentDidMount() {
		// create map
		this.map = L.map('map', {
		  center: [49.8419, 24.0315],
		  zoom: 16,
		  layers: [
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}),
		  ]
		});
	  }
	renderMarker(d, j, color, opacity) {
		/*Render maker with optional tooltip
         */
		return null;
	};
	renderMarkerLayer(layer) {
		/*Will show one marker per items in `layer.data`
         */
		return null;
	};
	renderHeatmapLayer(layer) {
		/* Create heatmap based on items in `layer.data`, each with weight 1.
         */
		return null;
	};
	renderClusterLayer(layer) {
		/*Will show one marker per items in `layer.data`
         */
		return null;;
	};
	renderPolylineLayer(layer) {
		/*Will show one marker per items in `layer.data`
         */
		return null;
	};
	render() {	
		return <div id="map"></div>
	}
}

export default  Map;
