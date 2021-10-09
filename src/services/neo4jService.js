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
          console.log(`Active graph is: ${activeGraph.name} - (${activeGraph.description})`);
          const { url, username, password } = activeGraph.connection.configuration.protocols.bolt;

          this.driver = createDriver(url, auth.basic(username, password));
          await this._getAvailableDatabases();
        }
      } catch (error) {
        console.log(error);
      }
    }

    return this.driver;
  };

  _getAvailableDatabases = async () => {
    const records = await this._runQuery("SHOW DATABASES YIELD name RETURN name;");
    const dbNames = records.map((rec) => rec._fields[0]).filter((name) => name !== "system");
    localStorage.setItem("available_databases", dbNames);
  };

  _runQuery = async (query, params = undefined) => {
    const driver = this.driver || (await this._getNeo4jDriver());

    if (!driver) {
      throw new Error("Failed to get driver");
    }

    const selectedDatabase = localStorage.getItem("selected_database") || "neo4j";
    const session = driver.session({ database: selectedDatabase });
    const records = (await session.run(query, params)).records;
    session.close();

    return records || [];
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

  getRelationshipLabels = async () => {
    const query =
      "CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType ORDER BY relationshipType;";
    const records = await this._runQuery(query);

    const res = records.map((record) => ({
      value: record.get("relationshipType"),
      label: record.get("relationshipType"),
    }));
    return res;
  };

  getRelationshipData = async (query, params) => {
    const records = await this._runQuery(query, params);
    let res = [];
    if (records === undefined || records.length === 0) {
      alert("No result found, please check your query");
      return {
        status: "ERROR",
        result: query,
      };
    }
    records.forEach((record) => {
      let el = {
        start: [record.get("start_latitude"), record.get("start_longitude")],
        end: [record.get("end_latitude"), record.get("end_longitude")],
      };
      if (record.has("tooltip") && record.get("tooltip") != null) {
        // make sure tooltip is a string, otherwise leaflet is not happy AT ALL!
        el["tooltip"] = record.get("tooltip").toString();
      }
      res.push(el);
    });

    return {
      status: 200,
      result: res,
    };
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
          tooltip: tooltip ? tooltip.toString() : undefined,
        };
      });

      return { status: 200, result };
    } catch (error) {
      const customError = new Error(`${error.message}, please check your query`);
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
