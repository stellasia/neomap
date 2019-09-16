import React, { Component } from 'react'
import { Map as LeafletMap, Marker, TileLayer, LayerGroup, LayersControl, FeatureGroup } from 'react-leaflet'
import L from 'leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer';


class Map extends Component {


    constructor(props) {
	super(props);

	this.renderLayer = this.renderLayer.bind(this);
    };


    renderLayer(layer) {
	if (layer.key !== undefined &&  layer.hidden === false){
	    var data = layer.data;
	    var color = layer.color;
	    var url = `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`;
	    var icon = new L.Icon({
		iconUrl: url
	    });

	    return (

		<LayersControl.Overlay name="Heatmap" checked>
                <FeatureGroup>
		{
		    data.map( (pos, j) => {
			return  <Marker key={j} position={pos} icon={icon} ></Marker>
		    })
		}
                <HeatmapLayer
		// fitBoundsOnLoad
		// fitBoundsOnUpdate
		points={data}
		longitudeExtractor={m => m[1]}
		latitudeExtractor={m => m[0]}
		intensityExtractor={m => 1}
                />
                </FeatureGroup>
		</LayersControl.Overlay>
	    );
	} else {
	    return "";
	}
    };

    render() {
	var layers = Object.entries(this.props.layers);

	var center ;
	if (layers.length > 0) {
	    // TODO: no need to loop on ALL layers here
	    layers.map( ([key, layer]) => {
		if (layer.key !== undefined && layer.hidden === false)
		    center = layer.position;
		return null
	    });
	} else {
	    center = [47, 3];
	}

	return (
            <LeafletMap center={center} zoom={11}>
            <LayersControl>
            <LayersControl.BaseLayer name="Base" checked>
            <TileLayer
	    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            </LayersControl.BaseLayer>
	    {
		layers.map( ([key, layer]) => {
		    return this.renderLayer(layer);
		})
	    }
            </LayersControl>
	    </LeafletMap>
	)
    }
};


export default  Map;
