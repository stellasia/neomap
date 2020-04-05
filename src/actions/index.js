export const ADD_LAYER = "ADD_LAYER";
export const REMOVE_LAYER = "REMOVE_LAYER";

export const addLayer = ({ layer }) => ({
    type: ADD_LAYER,
    layer
});

export const removeLayer = ({ ukey }) => ({
    type: REMOVE_LAYER,
    ukey
});
