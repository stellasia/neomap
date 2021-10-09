/**
 * Importing neo4jDesktopApi from __mocks__ adds a mock desktop api to the global window object
 * subsequent neo4jservice imports will use a mock api and driver *
 */
import "../../__mocks__/neo4jDesktopApi";

import { neo4jService } from "./neo4jService";
import { neo4jService as neo4jServiceCopy } from "./neo4jService";

jest.mock("neo4j-driver", () => {
  const mockRecord = new Map([
    ["name", "t-name"],
    ["label", "t-label"],
    ["layer", "t-layer"],
    ["tooltip", "t-tooltip"],
    ["propertyKey", "t-propertyKey"],
    ["longitude", "4321"],
    ["latitude", "1234"],
  ]);

  const mockSession = {
    run: jest.fn((_query, _params, _config) => {
      return new Promise((resolve, _reject) => {
        return resolve({ records: [mockRecord] });
      });
    }),
    close: jest.fn(),
  };

  const mockDriver = {
    session: jest.fn((_args) => mockSession),
  };

  return {
    auth: {
      basic: (_username, _password, _realm = undefined) => "AuthToken",
    },
    driver: jest.fn((_url, _authToken, _config) => mockDriver),
  };
});

describe("neo4jService tests", () => {
  it("is a singelton", () => {
    expect(neo4jService).toEqual(neo4jServiceCopy);
  });

  it("gets node labels", async () => {
    // Arrange
    const testNodeLabels = [
      {
        value: "t-label",
        label: "t-label",
      },
    ];

    // Act
    const nodeLabels = await neo4jService.getNodeLabels();

    // Assert
    expect(nodeLabels).toEqual({ status: 200, result: testNodeLabels });
  });

  it("gets properties", async () => {
    // Arrange
    const testProperties = [
      {
        value: "t-propertyKey",
        label: "t-propertyKey",
      },
    ];

    // Act
    const properties = await neo4jService.getProperties();

    // Assert
    expect(properties).toEqual({ status: 200, result: testProperties });
  });

  it("checks for spatial", async () => {
    // Act
    const hasSpatial = await neo4jService.hasSpatial();

    // Assert
    expect(hasSpatial).toEqual({ status: 200, result: true });
  });

  it("gets spatial layers", async () => {
    // Arrange
    const testSpatialLayers = [
      {
        value: "t-layer",
        label: "t-layer",
      },
    ];

    // Act
    const spatialLayers = await neo4jService.getSpatialLayers();

    // Assert
    expect(spatialLayers).toEqual({ status: 200, result: testSpatialLayers });
  });

  it("gets corect data", async () => {
    // Arrange
    const testData = [
      {
        pos: ["1234", "4321"],
        tooltip: "t-tooltip",
      },
    ];

    // Act
    const data = await neo4jService.getData();

    // Assert
    expect(data).toEqual({ status: 200, result: testData });
  });
});
