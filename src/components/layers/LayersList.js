import React, { Component } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { Layer } from './Layer';


export class LayersList extends Component {

	constructor(props) {
		super(props);

		this.renderLayers = this.renderLayers.bind(this);
		this.renderNewLayer = this.renderNewLayer.bind(this);
	};

	renderLayers() {
		// let layers = Object.entries(this.state.layers);
		return this.props.layers.map((layer) => {
			return (
				<Layer
					key={layer.ukey}
					ukey={layer.ukey}
					data-id="layers"
					layer={layer}
					driver={this.props.driver}
					addLayer={this.props.addLayer}
					updateLayer={this.props.updateLayer}
					removeLayer={this.props.removeLayer}
				/>
			);
		});
	};


	renderNewLayer() {
		let uid = (new Date().getTime() + Math.random()).toString(36);
		return (
			<Layer
				key={uid}
				ukey={uid}
				data-id="new-layer"
				driver={this.props.driver}
				addLayer={this.props.addLayer}
				updateLayer={this.props.updateLayer}
				removeLayer={this.props.removeLayer}
			/>
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
