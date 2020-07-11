import {SHOW_AREA} from "../actions/map";

const mapDefaultState = {};

const mapReducer = (state = mapDefaultState, action) => {
    switch (action.type) {
        case SHOW_AREA:
            return {
                showArea: action.showArea,
                ukey: action.ukey,
            };
        default:
            return state;
    }
};

export default mapReducer;
