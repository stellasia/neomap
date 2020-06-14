import neo4jService from '../services/neo4jService';

const SERVICE_INIT = "SERVICE_INIT";

const driverReducer = (state = {driver: undefined, ready: false}, action) => {
    switch (action.type) {
        case SERVICE_INIT:
            return neo4jService.getNeo4jDriver().then(
                (result) => {
                    return {
                        ...state,
                        driver: result,
                        ready: true,
                    }
                }
            );

        default:
            return state;
    }
};

export default driverReducer;