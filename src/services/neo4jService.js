import neo4j, { session } from "neo4j-driver";

/**
 * Hooks into the neo4jDesktopApi
 *
 * Note: this integration is going to be deprecated in desktop api 2.0
 */
const neo4jDesktopApi = window.neo4jDesktopApi;

/**
 * Returns a neo4j driver instance from the boltUrl, username, and passwords.
 *
 * Currently accepts bolt and bolt+routing
 * @param {String} boltUrl
 * @param {String} username
 * @param {String} password
 */
const createDriver = (boltUrl, username, password) =>
  neo4j.driver(boltUrl, neo4j.auth.basic(username, password));

class Neo4JService {
  constructor() {
    this.driver = this.getNeo4jDriver();
  }

  getNeo4jDriver = async () => {
    let driver = undefined;

    if (neo4jDesktopApi) {
      await neo4jDesktopApi.getContext().then((context) => {
        for (let project of context.projects) {
          for (let graph of project.graphs) {
            if (graph.status === "ACTIVE") {
              console.log(
                "Active graph is; " +
                graph.name +
                " (" +
                graph.description +
                ")"
              );
              let boltProtocol = graph.connection.configuration.protocols.bolt;
              driver = createDriver(
                boltProtocol.url,
                boltProtocol.username,
                boltProtocol.password
              );
            }
          }
        }
      });
    }

    return driver;
  };

  getNodeLabels = async () => {
    const driver = await this.driver;

    if (!driver) {
      return { status: 500, error: new Error('Failed to get driver') }
    }

    const query = "CALL db.labels() YIELD label RETURN label ORDER BY label";
    let res;

    try {
      const session = driver.session();
      const result = (await session.run(query)).map(record => {
        return {
          value: record.get("label"),
          label: record.get("label"),
        };
      });

      res = { status: 200, result };
    } catch (error) {
      res = { status: 500, error }
    } finally {
      session.close();
      return res;
    }
  };

  getProperties = async (nodeFilter) => {
    const driver = await this.driver;

    if (!driver) {
      return { status: 500, error: new Error('Failed to get driver') }
    }

    const query = nodeFilter ?
      `MATCH (n) WHERE true ${nodeFilter} WITH n LIMIT 100 UNWIND keys(n) AS key RETURN DISTINCT key AS propertyKey ORDER BY key` :
      "CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey ORDER BY propertyKey";
    let res;

    try {
      const result = (await session.run(query)).map(record => {
        return {
          value: record.get("propertyKey"),
          label: record.get("propertyKey"),
        };
      });

      res = { status: 200, result };
    } catch (error) {
      res = { status: 500, error }
    } finally {
      session.close();
      return res;
    }
  };

  hasSpatial = async () => {
    const driver = await this.driver;

    if (!driver) {
      return { status: 500, error: new Error('Failed to get driver') }
    }

    const query = "CALL spatial.procedures() YIELD name RETURN name LIMIT 1";
    let res;

    try {
      const session = driver.session();
      const result = await session.run(query);

      res = { status: 200, result: result.length > 0 };
    } catch (error) {
      res = { status: 500, error }
    } finally {
      session.close();
      return res;
    }
  };

  getSpatialLayers = async () => {
    const driver = await this.driver;

    if (!driver) {
      return { status: 500, error: new Error('Failed to get driver') }
    }

    const query = "MATCH (n:ReferenceNode)-[:LAYER]->(l)" +
      "WHERE l.layer_class = 'org.neo4j.gis.spatial.SimplePointLayer'" +
      "AND l.geomencoder = 'org.neo4j.gis.spatial.encoders.SimplePointEncoder'" +
      "RETURN l.layer as layer";
    let res;

    try {
      const session = driver.session();
      const result = (await session.run(query)).map(record => {
        return {
          value: record.get("layer"),
          label: record.get("layer"),
        }
      });

      res = { status: 200, result };
    } catch (error) {
      res = { status: 500, error }
    } finally {
      session.close();
      return res;
    }
  };

  getData = async (query, params) => {
    let res = [];
    const driver = await this.driver;

    if (!driver) {
      return { status: 500, error: new Error('Failed to get driver') }
    }


    try {
      const session = driver.session();
      const response = (await session.run(query, params));

      if (response.length > 0) {
        const result = response.map(record => {
          const position = [record.get("latitude"), record.get("longitude")];
          const tooltip = record.has("tooltip") && record.get("tooltip");

          return {
            pos: position,
            tooltip: tooltip && tooltip.toString()
          }
        });

        res = { status: 200, result };
      } else {
        res = { status: 500, error: new Error('No result found, please check your query') };
      }

    } catch (error) {
      res = { status: 500, error }
    } finally {
      session.close();
      return res;
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
