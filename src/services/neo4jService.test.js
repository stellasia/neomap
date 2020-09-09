import { neo4j } from 'neo4j-driver';
import { neo4jService } from './neo4jService';

const neo4jDesktopApiMock = {
  getContext: jest.fn(() => {
    const mockGraph = {
      name: 'mock graph',
      description: 'mock graph for testing',
      connection: {
        configuration: {
          protocols: {
            bolt: {
              url: '',
              username: '',
              password: ''
            }
          }
        }
      }
    }

    const mockProject = {
      graphs: [ mockGraph ]
    }

    const mockContext = {
      projects: [ mockProject ]
    }

    return Promise.resolve(mockContext);
  })
}

jest.mock('neo4j-driver', () => {
  const mockSession = {
    run: jest.fn(_query => []),
    close: jest.fn()
  }

  const mockDriver = {
    session: jest.fn(() => mockSession)
  }

  return {
    neo4j: {
      driver: jest.fn((_url, _username, _password) => mockDriver)
    }
  }
});

describe('neo4jService tests', () => {

  it('can have an undefined driver', async () => {
    // Act
    const driver = await neo4jService._getNeo4jDriver();

    // Assert
    expect(driver).toBeUndefined()
  });

  it('returns error code 500 when driver is undefined', async () => {
    // Arrange
    const errorResult = { status: 500, error: new Error("Failed to get driver") };
    const getDataCustomErrorResult = {
      status:500,
      error: new Error("Failed to get driver, please check your query")
    };

    // Act
    const driver = await neo4jService._getNeo4jDriver();

    // Assert
    expect(driver).toBeUndefined()
    expect(await neo4jService.getNodeLabels()).toEqual(errorResult);
    expect(await neo4jService.getProperties()).toEqual(errorResult);
    expect(await neo4jService.hasSpatial()).toEqual(errorResult);
    expect(await neo4jService.getSpatialLayers()).toEqual(errorResult);
    expect(await neo4jService.getData()).toEqual(getDataCustomErrorResult);
  });

  it('instantiates neo4jDesktop api', async () => {
    // Arrange
    // window.neo4jDesktopApi = neo4jDesktopApiMock;
    // const mockDriver = await neo4j.driver();

    // Act
    // const driver = await neo4jService._getNeo4jDriver();

    // Assert
    // console.info(driver)
    // expect(driver).toEqual(mockDriver);
    expect(true); // FIXME
  });

  it('gets node labels', async () => {
    // Arrange

    // Act

    // Assert
    expect(true); // FIXME
  });

  it('gets properties', async () => {
    // Arrange

    // Act

    // Assert
    expect(true); // FIXME
  });

  it('checks for spatial', async () => {
    // Arrange

    // Act

    // Assert
    expect(true); // FIXME
  });

  it('gets spatial layers', async () => {
    // Arrange

    // Act

    // Assert
    expect(true); // FIXME
  });

  it('gets corect data', async () => {
    // Arrange

    // Act

    // Assert
    expect(true); // FIXME
  });
});
