import neo4jService from '../services/neo4jService';

const SERVICE_INIT = "SERVICE_INIT";

const driverReducer = (state = {driver: undefined, ready: false}, action) => {
    switch (action.type) {
        case SERVICE_INIT:
            const driver = neo4jService.getNeo4jDriver().then(
                (result) => {
                    return {
                        ...state,
                        driver: result,
                        ready: true,
                    }
                }
            );
            return driver;

        default:
            return state;
    }
};

export default driverReducer;