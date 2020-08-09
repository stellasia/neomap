import React, {Component} from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { Layer, NEW_LAYER, NEW_LAYER_KEY } from './Layer';


export class SideBar extends Component {
	constructor(props) {
		super(props);

		this.state = {
			layers: []
		};

		this.renderLayers = this.renderLayers.bind(this);
		this.renderNewLayer = this.renderNewLayer.bind(this);
		this.deleteLayer = this.deleteLayer.bind(this);
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
		// let layers = Object.entries(this.state.layers);
		return this.state.layers.map((layer) => {
			return (
				<Layer data-id="layers" key={layer.ukey} ukey={layer.ukey} layer={layer} deleteLayer={this.props.deleteLayer}
					   sendData={this.sendData} driver={this.props.driver}/>
			);
		});
	};

	renderNewLayer() {
		return (
			<Layer key={NEW_LAYER_KEY} data-id="new-layer" ukey={NEW_LAYER_KEY} layer={NEW_LAYER} deleteLayer={this.props.deleteLayer} sendData={this.sendData}
						driver={this.props.driver} />
		);
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
