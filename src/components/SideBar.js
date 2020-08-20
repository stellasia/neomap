import React, { Component } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { Layer, NEW_LAYER } from './Layer';


export class SideBar extends Component {

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
		return (
			<Layer
				key={NEW_LAYER.ukey}
				data-id="new-layer"
				layer={NEW_LAYER}
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
