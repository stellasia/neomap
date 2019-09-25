import React, { Component } from 'react'
import { Map as LeafletMap, Marker, TileLayer, LayersControl, FeatureGroup } from 'react-leaflet'
import L from 'leaflet';


class Map extends Component {


    constructor(props) {
	super(props);

	this.renderLayer = this.renderLayer.bind(this);
    };


    renderLayer(layer) {
	if (layer.ukey !== undefined){
	    var data = layer.data;
	    var color = layer.color;
	    var url = `https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`;
	    var icon = new L.Icon({
		iconUrl: url
	    });

	    return (

		<LayersControl.Overlay key={layer.ukey} name={layer.name} checked>
                <FeatureGroup>
		{
		    data.map( (pos, j) => {
			return  <Marker key={j} position={pos} icon={icon} ></Marker>
		    })
		}
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
		    return this.renderLayer(layer);
		})
	    }
            </LayersControl>
	    </LeafletMap>
	)
    }
};


export default  Map;
