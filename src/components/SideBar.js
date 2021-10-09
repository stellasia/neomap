import React from "react";
import Accordion from "react-bootstrap/Accordion";
import { Layer } from "./Layer";
import { NEW_LAYER } from "./constants";
import { generateUkeyFromName } from "./utils";

export const SideBar = React.memo(({ layers, addLayer, updateLayer, removeLayer }) => {
  const renderLayers = () => {
    return [...layers, { ...NEW_LAYER }].map((layer) => {
      const isNew = layer.ukey === undefined;
      layer.ukey = layer.ukey || generateUkeyFromName();
      return (
        <Layer
          key={layer.ukey}
          data-id="layers"
          layer={layer}
          isNew={isNew}
          addLayer={addLayer}
          updateLayer={updateLayer}
          removeLayer={removeLayer}
        />
      );
    });
  };

  return <Accordion>{renderLayers()}</Accordion>;
});
