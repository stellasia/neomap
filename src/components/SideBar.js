import React, { Component } from 'react';
import { LayersList } from './layers/LayersList';


export class SideBar extends Component {

	// TODO: move menu bar here or consider removing this component

	render() {
		return (
			<LayersList
				driver={this.props.driver}
				layers={this.props.layers}
				addLayer={this.addLayer}
				updateLayer={this.updateLayer}
				removeLayer={this.removeLayer}
			/>
		);
	};
}
