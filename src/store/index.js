import { createStore, combineReducers } from 'redux';
import layerReducer from "../reducers/layers";
import driverReducer from "../reducers/driver";

export default () => {
    const store = createStore(
        combineReducers({
            layers: layerReducer,
            driver: driverReducer,
        })
    );
    return store
};
