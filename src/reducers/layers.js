import {ADD_LAYER, REMOVE_LAYER} from '../actions'

const layerDefaultState = [];

const layerReducer = (state = layerDefaultState, action) => {
    switch (action.type) {
        case ADD_LAYER:
            return [
                ...state,
                action.layer
            ];
        case REMOVE_LAYER:
            return state.filter( ( {ukey} ) => (
                ukey !== action.ukey
            ));
        default:
            return state;
    }
};

export default layerReducer;