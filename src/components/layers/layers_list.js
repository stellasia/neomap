import React, { Component } from 'react';
import Layer from './layer'


class LayersList extends Component {

    constructor(props) {
	super(props);

	this.state = {
	    driver: props.driver,
	    layers: props.layers
	};

	this.sendData = this.sendData.bind(this);
	this.renderLayers = this.renderLayers.bind(this);
	this.renderNewLayer = this.renderNewLayer.bind(this);

    };


    sendData(data) {
	var new_layer = data.layer;
	var layers = this.state.layers;
	layers[new_layer.key] = new_layer;
	this.setState({
	    layers: layers
	});
	this.props.sendData({
	    layers: layers
	});
    };


    renderLayers() {
	var layers = Object.entries(this.state.layers);
	return layers.map( ([key,layer]) => {
	    return (
		<Layer key={layer.key} sendData={this.sendData} layer={layer} driver={this.state.driver} />
	    );
	});
    };


    renderNewLayer() {
	var layers = Object.entries(this.state.layers);
	if (layers.length === 0) {
            return (
		<div>
		<Layer key={undefined} sendData={this.sendData} layer={undefined} driver={this.state.driver} />
		</div>
            )
	};
	return "";
    };


    render() {
	return (
	    <div>
            {this.renderLayers()}
            {this.renderNewLayer()}
	    </div>
	)
    };
};


export default LayersList;
