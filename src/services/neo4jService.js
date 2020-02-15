const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js");
const neo4jDesktopApi = window.neo4jDesktopApi;


export default {
    getNeo4jDriver: async function() {
        let driver = undefined;
        if (neo4jDesktopApi) {
            await neo4jDesktopApi.getContext().then(context => {
                for (let project of context.projects) {
                    for (let graph of project.graphs) {
                        if (graph.status === 'ACTIVE') {
                            console.log("Active graph is; " + graph.name + " (" + graph.description + ")");
                            let boltProtocol = graph.connection.configuration.protocols.bolt;
                            driver = neo4j.v1.driver(
                                boltProtocol.url,
                                neo4j.v1.auth.basic(boltProtocol.username, boltProtocol.password)
                            );
                        }
                    }
                }
            });
        }
        return driver;
    },

    getNodeLabels: async function(driver) {
        if (driver === undefined)
            return [];

        var res = [];
        const session = driver.session();
        await session
            .run(
                `CALL db.labels() YIELD label RETURN label ORDER BY label`,
            )
            .then(function (result) {
                result.records.forEach(function (record) {
                    var el = {
                        value:record.get("label"),
                        label: record.get("label")
                    };
                    res.push(el);
                });
                session.close();
            })
            .catch(function (error) {
                console.log(error);
            });

        return res;
    },

    getProperties: async function(driver, nodeFilter) {
        if (driver === undefined)
            return [];

        var res = [];
        const session = driver.session();
        var query = "";
        if (nodeFilter !== "") {
            query = "MATCH (n) WHERE true ";
            query += nodeFilter;
            query += " WITH n LIMIT 100 UNWIND keys(n) AS key RETURN DISTINCT key AS propertyKey ORDER BY key";
        } else {
            query = "CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey ORDER BY propertyKey"
        }
        await session
            .run(
                query
            )
            .then(function (result) {
                result.records.forEach(function (record) {
                    var el = {
                        value: record.get("propertyKey"),
                        label: record.get("propertyKey")
                    };
                    res.push(el);
                });
                session.close();
            })
            .catch(function (error) {
                console.log(error);
            });
        return res;
    },

    getData: async function(driver, query, params) {
        const session = driver.session();
        let res = await session
            .run(
                query, params
            )
            .then(result => {
                var res = [];
                if ((result.records === undefined) || (result.records.length === 0)) {
                    alert("No result found, please check your query");
                    return {
                        status: "ERROR",
                        result: query
                    };
                }
                result.records.forEach(record => {
                    var el = {
                        pos: [
                            record.get("latitude"),
                            record.get("longitude")
                        ],
                        tooltip: record.get("tooltip")
                    };
                    res.push(el);
                });
                session.close();
                return {
                    status: "OK",
                    result: res
                };
            })
            .catch(error => {
                return {status: "ERROR", result: error};
            });
        return res;
    }
};