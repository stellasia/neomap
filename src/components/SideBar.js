import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { Layer } from './Layer';
import { NEW_LAYER } from './constants';

export const SideBar = React.memo(({ layers, addLayer, updateLayer, removeLayer }) => {

	const renderLayers = () => {
		return [...layers, NEW_LAYER].map((layer) => {
			return (
				<Layer
					key={layer.ukey}
					data-id="layers"
					layer={layer}
					addLayer={addLayer}
					updateLayer={updateLayer}
					removeLayer={removeLayer}
				/>
			);
		});
	};

	return (
		<Accordion>
			{renderLayers()}
		</Accordion>
	)
});
