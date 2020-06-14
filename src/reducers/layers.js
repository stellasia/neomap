import {ADD_OR_UPDATE_LAYER, REMOVE_LAYER, SET_LAYERS} from '../actions'

const layerDefaultState = [];

const layerReducer = (state = layerDefaultState, action) => {
    switch (action.type) {
        case SET_LAYERS:
            return action.layers;
        case ADD_OR_UPDATE_LAYER:
            let res = [];
            let added = false;
            for (let layer of state) {
                if (layer.ukey === action.layer.ukey) {
                    res.push(action.layer);
                    added = true;
                } else {
                    res.push(layer);
                }
            }
            if (added === false)  // new layer are not yet in the layer list
                res.push(action.layer);
            return res;
        case REMOVE_LAYER:
            return state.filter(({ukey}) => (
                ukey !== action.ukey
            ));
        default:
            return state;
    }
};

export default layerReducer;