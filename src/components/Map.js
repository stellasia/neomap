import React, { Component } from 'react'
import { Map as LeafletMap, Marker, TileLayer, LayersControl, FeatureGroup, Tooltip } from 'react-leaflet'
import HeatmapLayer from 'react-leaflet-heatmap-layer';
import L from 'leaflet';


class Map extends Component {


    constructor(props) {
	super(props);

	this.renderMarkerLayer = this.renderMarkerLayer.bind(this);
	this.renderHeatmapLayer = this.renderHeatmapLayer.bind(this);
	this.renderClusterLayer = this.renderClusterLayer.bind(this);
    };


    renderMarker(d, j, icon) {
	/*Render maker with optional tooltip
	*/
	if (d.tooltip) {
	    return (
		<Marker key={j} position={d.pos} icon={icon} >
		<Tooltip>{d.tooltip}</Tooltip>
		</Marker>
	    )
	}
	return (
	    <Marker key={j} position={d.pos} icon={icon} >
	    </Marker>
	)
    };


    renderMarkerLayer(layer) {
	/*Will show one marker per items in `layer.data`
	*/
	var data = layer.data;
	var color = layer.color.value;
	var url = `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`;
	var icon = new L.Icon({
	    iconUrl: url
	});
	return (
	    <LayersControl.Overlay key={layer.ukey} name={layer.name} checked>
            <FeatureGroup>
	    {
		data.map( (d, j) => {
		    return this.renderMarker(d, j, icon);
		})
	    }
            </FeatureGroup>
	    </LayersControl.Overlay>
	);
    };


    renderHeatmapLayer(layer) {
	/* Create heatmap based on items in `layer.data`, each with weight 1.
	*/
	var data = layer.data;
	return (
	    <LayersControl.Overlay key={layer.ukey} name={layer.name} checked>
	    <HeatmapLayer
            points={data}
            latitudeExtractor={m => m.pos[0]}
            longitudeExtractor={m => m.pos[1]}
            intensityExtractor={m => 1}
	    radius={layer.radius}
	    minOpacity={0.1}
	    max={10}
            />
	    </LayersControl.Overlay>
	);
    };


    renderClusterLayer(layer) {
	/*TODO: cluster layer
	*/
	return "Cluster layer not supported for now";
    };


    render() {
	var layers = Object.entries(this.props.layers);

	/*Map center will be the one of the last layer...
	   TODO: compute zoom or use leaflet tools to set it automatically?
	*/
	var center ;
	var zoom ;
	if (layers.length > 0) {
	    // TODO: no need to loop on ALL layers here
	    layers.map( ([key, layer]) => {
		if (layer.ukey !== undefined)
		    center = layer.position;
		return null
	    });
	    zoom = 11;
	} else {
	    center = [47, 3];
	    zoom = 4;
	}

	return (
            <LeafletMap center={center} zoom={zoom}>
            <LayersControl>
            <LayersControl.BaseLayer name="Base" checked>
            <TileLayer
	    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            </LayersControl.BaseLayer>
	    {
		layers.map( ([key, layer]) => {
		    if (layer.ukey !== undefined) {
			if (layer.rendering === "markers")
			    return this.renderMarkerLayer(layer);
			if (layer.rendering === "heatmap")
			    return this.renderHeatmapLayer(layer);
			if (layer.rendering === "clusters")
			    return this.renderClusterLayer(layer);
			return "";
		    }
		    return "";
		})
	    }
            </LayersControl>
	    </LeafletMap>
	)
    }
};


export default  Map;
