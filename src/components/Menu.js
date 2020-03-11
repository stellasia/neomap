import {Nav, Navbar, NavDropdown} from "react-bootstrap";
import React, {Component} from "react";


class Menu extends Component {

    render() {
        return (
            <Navbar>
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <NavDropdown title="File" id="basic-nav-dropdown">
                            <NavDropdown.Item
                                href="#"
                                onClick={(e) => this.props.saveConfigToFile(e)}
                                className="beta"
                            >
                                Save As
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                href="#"
                                onClick={(e) => this.props.loadConfigFromFile(e)}
                                className="beta"
                            >
                                Open
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}


export default Menu;
