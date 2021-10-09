import React from "react";
import { render, cleanup } from "@testing-library/react";
import { Menu } from "./Menu";

describe("Menu tests", () => {
  it("renders the color picker", () => {
    const menu = render(<Menu />).container;

    expect(menu).toBeDefined();
  });

  afterEach(() => {
    cleanup();
  });
});
