import {combineReducers, createStore} from 'redux';
import { layerReducer } from "./reducers/layers";
// import { driverReducer } from "../reducers/driver";

export const configureStore = () => {
    return createStore(
        combineReducers({
            layers: layerReducer,
            // driver: driverReducer,
        })
    );
};
