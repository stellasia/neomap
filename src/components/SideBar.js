import React, {Component} from 'react';
import LayersList from './layers/LayersList';


class SideBar extends Component {

	// TODO: move menu bar here or consider removing this component

	render() {
		return (
			<LayersList
				driver={this.props.driver}
			/>
		);
	};
}


export default SideBar;
