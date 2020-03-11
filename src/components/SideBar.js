import React, { Component } from 'react';
import LayersList from './layers/layers_list';


class SideBar extends Component {

	constructor(props) {
		super(props);

		this.state = {
			layers: props.layers,
			driver: props.driver
		};

		this.sendData = this.sendData.bind(this);
		this.forceUpdateLayers = this.forceUpdateLayers.bind(this);

	};


	sendData(layers) {
		/*Receives data from child layer
           and propagate it to parent
         */
		this.setState({layers: layers.layers});
		this.props.layersChanged({layers: layers.layers});
	};


	forceUpdateLayers(layers) {
		this.setState({layers: layers});
		this.refs.layerlist.forceUpdateLayers(layers);
	};


	render() {
		return (
			<LayersList
				ref="layerlist"
				layers = {this.state.layers}
				sendData = {this.sendData}
				driver = {this.state.driver}
			/>
		);
	};
}


export default SideBar;
