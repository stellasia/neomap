import neo4j from "neo4j-driver";

/**
 * Hooks into the neo4jDesktopApi
 *
 * Note: this integration is going to be deprecated in desktop api 2.0
 */
const neo4jDesktopApi = window.neo4jDesktopApi;

class Neo4JService {
  constructor() {
    this.driver = this._getNeo4jDriver();
  }

  _getNeo4jDriver = async () => {
    if (neo4jDesktopApi) {
      await neo4jDesktopApi.getContext().then((context) => {
        for (let project of context.projects) {
          for (let graph of project.graphs) {
            if (graph.status === "ACTIVE") {
              console.log(`Active graph is; ${graph.name} (${graph.description})`);

              let boltProtocol = graph.connection.configuration.protocols.bolt;

              const driver = neo4j.driver(
                boltProtocol.url,
                boltProtocol.username,
                boltProtocol.password
              );

              // Already found and athenticated an active graph.
              // No need to try and authenticate other graphs.
              return driver;
            }
          }
        }
      });
    }

    return undefined;
  };

  _runQuery = async (query) => {
    const driver = await this.driver;

    if (!driver) {
      return { status: 500, error: new Error('Failed to get driver') }
    }

    const session = driver.session();

    const records = (await session.run(query)).records;

    session.close();

    if (records && records.length > 0) {
      return records;
    } else {
      throw new Error("No records found");
    }
  }


  getNodeLabels = async () => {
    const query = "CALL db.labels() YIELD label RETURN label ORDER BY label";

    try {
      const records = this._runQuery(query)

      const result = records.map(record => {
        return {
          value: record.get("label"),
          label: record.get("label"),
        };
      });

      return { status: 200, result };
    } catch (error) {
      return { status: 500, error }
    }
  };

  getProperties = async (nodeFilter) => {
    const query = nodeFilter ?
      `MATCH (n) WHERE true ${nodeFilter} WITH n LIMIT 100 UNWIND keys(n) AS key RETURN DISTINCT key AS propertyKey ORDER BY key` :
      "CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey ORDER BY propertyKey";

    try {
      const records = this._runQuery(query);

      const result = records.map(record => {
        return {
          value: record.get("propertyKey"),
          label: record.get("propertyKey"),
        };
      });

      return { status: 200, result };
    } catch (error) {
      return { status: 500, error }
    }
  };

  hasSpatial = async () => {
    const query = "CALL spatial.procedures() YIELD name RETURN name LIMIT 1";

    try {
      (await session.run(query)).records;

      return { status: 200, result: true };
    } catch (error) {
      return { status: 500, error }
    }
  };

  getSpatialLayers = async () => {
    const query = "MATCH (n:ReferenceNode)-[:LAYER]->(l)" +
      "WHERE l.layer_class = 'org.neo4j.gis.spatial.SimplePointLayer'" +
      "AND l.geomencoder = 'org.neo4j.gis.spatial.encoders.SimplePointEncoder'" +
      "RETURN l.layer as layer";

    try {
      const records = (await session.run(query)).records;

      const result = records.map(record => {
        return {
          value: record.get("layer"),
          label: record.get("layer"),
        }
      });

      return { status: 200, result };
    } catch (error) {
      return { status: 500, error }
    }
  };

  getData = async (query, params) => {
    const session = driver.session();

    try {
      const records = (await session.run(query, params)).records;

      const result = records.map(record => {
        const position = [record.get("latitude"), record.get("longitude")];
        const tooltip = record.has("tooltip") && record.get("tooltip");

        return {
          pos: position,
          tooltip: tooltip && tooltip.toString()
        }
      });

      return { status: 200, result };
    } catch (error) {
      const customError = new Error(`${error.message}, please check your query`)
      return { status: 500, error: customError }
    }
  };
};

// Singleton Neo4JService
export const neo4jService = (() => {
  let serviceInstance;

  if (!serviceInstance) {
    serviceInstance = new Neo4JService();
  }

  return serviceInstance;
})();
