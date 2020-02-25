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

        let res = [];
        const session = driver.session();
        await session
            .run(
                `CALL db.labels() YIELD label RETURN label ORDER BY label`,
            )
            .then(function (result) {
                result.records.forEach(function (record) {
                    let el = {
                        value: record.get("label"),
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

        let res = [];
        const session = driver.session();
        let query = "";
        if (nodeFilter !== "") {
            query += "MATCH (n) WHERE true ";
            query += nodeFilter;
            query += " WITH n LIMIT 100 UNWIND keys(n) AS key RETURN DISTINCT key AS propertyKey ORDER BY key";
        } else {
            query += "CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey ORDER BY propertyKey"
        }
        await session
            .run(
                query
            ).then(function (result) {
                result.records.forEach(function (record) {
                    let el = {
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

    hasSpatial: async function(driver) {
        if (driver === undefined)
            return false;

        let res = false;
        const session = driver.session();
        await session.run("CALL spatial.procedures() YIELD name RETURN name LIMIT 1").then(() => {
            res = true;
            session.close();
        }).catch(error => {
            console.log(error);
        });
        return res;
    },

    getSpatialLayers: async function(driver) {
        if (driver === undefined)
            return [];

        let res = [];
        const session = driver.session();
        session.run(
            "MATCH (n:ReferenceNode)-[:LAYER]->(l)" +
            "WHERE l.layer_class = 'org.neo4j.gis.spatial.SimplePointLayer'" +
            "AND l.geomencoder = 'org.neo4j.gis.spatial.encoders.SimplePointEncoder'" +
            "RETURN l.layer as layer"
        ).then(result => {
            result.records.forEach(record => {
                let el = {
                    value: record.get("layer"),
                    label: record.get("layer")
                };
                res.push(el);
                session.close();
            })
        }).catch(function (error) {
            console.log(error);
        });
        return res;
    },

    getData: async function(driver, query, params) {
        const session = driver.session();
        let result = await session
            .run(
                query, params
            )
            .then(response => {
                let res = [];
                if ((response.records === undefined) || (response.records.length === 0)) {
                    alert("No result found, please check your query");
                    return {
                        status: "ERROR",
                        result: query
                    };
                }
                response.records.forEach(record => {
                    let el = {
                        pos: [
                            record.get("latitude"),
                            record.get("longitude")
                        ],
                    };
                    if (record.has("tooltip") && record.get("tooltip") !== null) {
                        // make sure tooltip is a string, otherwise leaflet is not happy AT ALL!
                        el["tooltip"] = record.get("tooltip").toString();
                    }
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
        return result;
    }
};