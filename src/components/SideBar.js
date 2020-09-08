import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import { Layer } from './Layer';
import { NEW_LAYER } from './constants';

export const SideBar = React.memo(({driver, layers, addLayer, updateLayer, removeLayer}) => {

	const renderLayers = () => {
		return layers.map((layer) => {
			return (
				<Layer
					key={layer.ukey}
					data-id="layers"
					layer={layer}
					driver={driver}
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
			<Layer
				key={NEW_LAYER.ukey}
				data-id="new-layer"
				layer={NEW_LAYER}
				driver={driver}
				addLayer={addLayer}
				updateLayer={updateLayer}
				removeLayer={removeLayer}
			/>
		</Accordion>
	)
});
