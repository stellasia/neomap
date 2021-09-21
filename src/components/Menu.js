import React from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import SettingsModal from "./SettingsModal";

export const Menu = React.memo(({ saveConfigToFile, loadConfigFromFile }) => {
  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
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
            <Nav.Link onClick={handleShow}> Settings </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <SettingsModal handleClose={handleClose} handleShow={handleShow} show={show}/>
    </>
  );
});
