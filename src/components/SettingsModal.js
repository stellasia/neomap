import React, {useState} from "react";
import { Nav, Navbar, NavDropdown, Modal, Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form'

export default function SettingsModal({handleClose, handleShow, show}) {
  const getOptions = () => {
    const databases = localStorage.getItem("available_databases").split(",")
    return databases.map(dbName => {
      return <option value={dbName}> {dbName} </option>
    })
  }
  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{color: "black"}}>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{color: "black"}}>
        <Form.Group controlId="formBasicSelect">
          <Form.Label>Select Database</Form.Label>
          <Form.Control as="select" aria-label="Default select example">
            {getOptions()}
          </Form.Control>
        </Form.Group>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
}