Object.defineProperty(window, "confirm", {
  value: jest.fn().mockImplementation(() => {
    return true;
  }),
});
