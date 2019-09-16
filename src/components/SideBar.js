import React, { Component } from 'react';
import LayersList from './layers/layers_list';


class SideBar extends Component {

    constructor(props) {
	super(props);

	this.sendData = this.sendData.bind(this);

	this.state = {
	    layers: props.layers,
	}

	// this.latitude = React.createRef();
	// this.longitude = React.createRef();
    };

    sendData(layers) {
	this.setState({
	    layers: layers.layers
	});
	this.props.layersChanged({
	    layers: layers.layers
	});
    };

    render() {
	return (
	    <LayersList
	    nodes = {this.props.nodes}
	    layers = {this.state.layers}
	    sendData = {this.sendData}
	    driver = {this.props.driver}
	    />
	);
    }
}

export default SideBar;
