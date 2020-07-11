import {combineReducers, createStore} from 'redux';
import layerReducer from "../reducers/layers";
import mapReducer from "../reducers/map";
// import driverReducer from "../reducers/driver";

export default () => {
    return createStore(
        combineReducers({
            layers: layerReducer,
            map: mapReducer,
            // driver: driverReducer,
        })
    );
};
