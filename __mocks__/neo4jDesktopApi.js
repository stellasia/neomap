Object.defineProperty(window, "neo4jDesktopApi", {
  writable: true,
  value: {
    getContext: jest.fn().mockImplementation(() => {
      const mockGraph = {
        name: "mock graph",
        description: "mock graph for testing",
        status: "ACTIVE",
        connection: {
          configuration: {
            protocols: {
              bolt: {
                url: "",
                username: "",
                password: "",
              },
            },
          },
        },
      };

      const mockProject = {
        graphs: [mockGraph],
      };

      const mockContext = {
        projects: [mockProject],
      };

      return Promise.resolve(mockContext);
    }),
  },
});
