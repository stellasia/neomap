export const ADD_OR_UPDATE_LAYER = "ADD_LAYER";
export const REMOVE_LAYER = "REMOVE_LAYER";

export const addOrUpdateLayer = ({layer}) => ({
    type: ADD_OR_UPDATE_LAYER,
    layer
});

export const removeLayer = ({ ukey }) => ({
    type: REMOVE_LAYER,
    ukey
});
