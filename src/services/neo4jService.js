import { driver as createDriver, auth } from "neo4j-driver";

class Neo4JService {
  _getNeo4jDriver = async () => {
    if (!this.driver) {
      try {
        /**
         * Hooks into the neo4jDesktopApi.
         * Note: this integration is going to be deprecated in desktop api 2.0
         */
        const context = await window.neo4jDesktopApi.getContext();

        const activeGraph = context.projects
          .map((project) => ({
            graphs: project.graphs.filter((graph) => graph.status === "ACTIVE"),
          }))
          .reduce((acc, { graphs }) => acc.concat(graphs), [])[0];

        if (activeGraph) {
          console.log(
            `Active graph is: ${activeGraph.name} - (${activeGraph.description})`
          );
          const {
            url,
            username,
            password,
          } = activeGraph.connection.configuration.protocols.bolt;

          this.driver = createDriver(url, auth.basic(username, password));
        }
      } catch (error) {
        console.log(error);
      }
    }

    return this.driver;
  };

  _runQuery = async (query, params = undefined) => {
    const driver = this.driver || (await this._getNeo4jDriver());

    if (!driver) {
      throw new Error("Failed to get driver");
    }

    const session = driver.session();

    const records = await session.run(query, params).then(
      (records) => records,
      (error) => {
        console.log(error);
        return [];
      }
    );

    session.close();

    if (records && records.length > 0) {
      return records;
    } else {
      throw new Error("No records found");
    }
  };

  getNodeLabels = async () => {
    const query = "CALL db.labels() YIELD label RETURN label ORDER BY label";

    try {
      const records = await this._runQuery(query);

      const result = records.map((record) => {
        return {
          value: record.get("label"),
          label: record.get("label"),
        };
      });

      return { status: 200, result };
    } catch (error) {
      return { status: 500, error };
    }
  };

  getProperties = async (nodeFilter) => {
    const query = nodeFilter
      ? `MATCH (n) WHERE true ${nodeFilter} WITH n LIMIT 100 UNWIND keys(n) AS key RETURN DISTINCT key AS propertyKey ORDER BY key`
      : "CALL db.propertyKeys() YIELD propertyKey RETURN propertyKey ORDER BY propertyKey";

    try {
      const records = await this._runQuery(query);

      const result = records.map((record) => {
        return {
          value: record.get("propertyKey"),
          label: record.get("propertyKey"),
        };
      });

      return { status: 200, result };
    } catch (error) {
      return { status: 500, error };
    }
  };

  hasSpatial = async () => {
    const query = "CALL spatial.procedures() YIELD name RETURN name LIMIT 1";

    try {
      await this._runQuery(query);

      return { status: 200, result: true };
    } catch (error) {
      return { status: 500, error };
    }
  };

  getSpatialLayers = async () => {
    const query =
      "MATCH (n:ReferenceNode)-[:LAYER]->(l)" +
      "WHERE l.layer_class = 'org.neo4j.gis.spatial.SimplePointLayer'" +
      "AND l.geomencoder = 'org.neo4j.gis.spatial.encoders.SimplePointEncoder'" +
      "RETURN l.layer as layer";

    try {
      const records = await this._runQuery(query);

      const result = records.map((record) => {
        return {
          value: record.get("layer"),
          label: record.get("layer"),
        };
      });

      return { status: 200, result };
    } catch (error) {
      return { status: 500, error };
    }
  };

  getData = async (query, params) => {
    try {
      const records = await this._runQuery(query, params);

      const result = records.map((record) => {
        const position = [record.get("latitude"), record.get("longitude")];
        const tooltip = record.has("tooltip") && record.get("tooltip");

        return {
          pos: position,
          tooltip: tooltip ? tooltip.toString() : "",
        };
      });

      return { status: 200, result };
    } catch (error) {
      const customError = new Error(
        `${error.message}, please check your query`
      );
      return { status: 500, error: customError };
    }
  };
}

/**
 * Singleton Neo4JService
 */
export const neo4jService = (() => {
  let serviceInstance;

  if (!serviceInstance) {
    serviceInstance = new Neo4JService();
  }

  return serviceInstance;
})();
