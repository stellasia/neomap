import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { Layer, NEW_LAYER, NEW_LAYER_KEY } from './Layer';


export const SideBar = React.memo((props) => {
	const { layers, removeLayer, addLayer, updateLayer } = props;

	const renderLayers = () => {
		return layers.map((layer) => {
			return (
				<Layer
					data-id="layers"
					key={layer.ukey}
					ukey={layer.ukey}
					layer={layer}
					updateLayer={updateLayer}
					removeLayer={removeLayer}
				/>
			);
		});
	};

	const renderNewLayer = () =>{
		return (
			<Layer
				key={NEW_LAYER_KEY}
				data-id="new-layer"
				ukey={NEW_LAYER_KEY}
				layer={NEW_LAYER}
				addLayer={addLayer}
			/>
		);
	};

	return (
		<Accordion>
			{renderLayers()}
			{renderNewLayer()}
		</Accordion>
	)
});
