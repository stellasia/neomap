import React, {Component} from 'react';
import LayersList from './layers/LayersList';


class SideBar extends Component {

	constructor(props) {
		super(props);

		this.forceUpdateLayers = this.forceUpdateLayers.bind(this);

	};


	forceUpdateLayers(layers) {
		this.setState({layers: layers});
		// this.refs.layerlist.forceUpdateLayers(layers);
	};


	render() {
		return (
			<LayersList
				// ref="layerlist"
				driver={this.props.driver}
			/>
		);
	};
}


export default SideBar;
