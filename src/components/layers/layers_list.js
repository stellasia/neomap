import React, {Component} from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Layer from './layer';


class LayersList extends Component {

	constructor(props) {
		super(props);

		this.state = {
			driver: props.driver,
			layers: props.layers
		};

		this.updateLayers = this.updateLayers.bind(this);
		this.sendData = this.sendData.bind(this);
		this.renderLayers = this.renderLayers.bind(this);
		this.renderNewLayer = this.renderNewLayer.bind(this);
		this.deleteLayer = this.deleteLayer.bind(this);
	};


	sendData(data) {
		/*Receives new data from child layer
           and propagate it to parent
        */
		let new_layer = data.layer;
		let layers = this.state.layers;
		layers[new_layer.ukey] = new_layer;
		this.setState({
			layers: layers
		});
		this.props.sendData({
			layers: layers
		});
	};


	deleteLayer(ukey) {
		/*Remove a specific ukey from
           `this.state.layers` map
           and re-render map component
        */
		let layers = this.state.layers;
		delete layers[ukey];
		this.setState({
			layers: layers
		});
		this.props.sendData({
			layers: layers
		});
	};


	renderLayers() {
		let layers = Object.entries(this.state.layers);
		return layers.map(([, layer]) => {
			return (
				<Layer data-id="layers" key={layer.ukey} ukey={layer.ukey} layer={layer} deleteLayer={this.deleteLayer}
					   sendData={this.sendData} driver={this.state.driver}/>
			);
		});
	};


	renderNewLayer() {
		let uid = (new Date().getTime() + Math.random()).toString(36);
		return (
			<Layer key={uid} data-id="new-layer" ukey={uid} layer={undefined} sendData={this.sendData}
				   driver={this.state.driver}/>
		);
	};


	updateLayers(layers) {
		this.setState({
			layers: layers,
		});
	};

	render() {
		return (
			<Accordion>
				{this.renderLayers()}
				{this.renderNewLayer()}
			</Accordion>
		)
	};
}


export default LayersList;
