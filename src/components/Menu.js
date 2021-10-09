import React from "react";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import SettingsModal from "./SettingsModal";
import ChevronLeftIcon from "@icons/material/ChevronLeftIcon";
import ChevronRightIcon from "@icons/material/ChevronRightIcon";

export const Menu = React.memo(({ saveConfigToFile, loadConfigFromFile, toggleCollapse, collapsed }) => {
  const [showModal, setShowModal] = React.useState(false);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <>
      <Navbar>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <NavDropdown title="File" id="basic-nav-dropdown">
              <NavDropdown.Item href="#" onClick={(e) => saveConfigToFile(e)} className="beta">
                Save As
              </NavDropdown.Item>
              <NavDropdown.Item href="#" onClick={(e) => loadConfigFromFile(e)} className="beta">
                Open
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link onClick={handleShow}> Settings </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link id="collapse-button" onClick={toggleCollapse} style={{ marginLeft: "auto" }}>
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <SettingsModal handleClose={handleClose} show={showModal} />
    </>
  );
});
