import React from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";


const Menu = ({ saveConfigToFile, loadConfigFromFile }) => {
  return (
    <Navbar>
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <NavDropdown title="File" id="basic-nav-dropdown">
            <NavDropdown.Item
              href="#"
              onClick={(e) => saveConfigToFile(e)}
              className="beta"
            >
              Save As
            </NavDropdown.Item>
            <NavDropdown.Item
              href="#"
              onClick={(e) => loadConfigFromFile(e)}
              className="beta"
            >
              Open
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Menu;
