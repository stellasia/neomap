import React, { useState } from "react";
import { Nav, Navbar, NavDropdown, Modal, Button } from "react-bootstrap";
import Select from "react-select";
import Form from "react-bootstrap/Form";

export default function SettingsModal({ handleClose, show }) {
  const initialDb = localStorage.getItem("selected_database") || "neo4j";
  const [database, setDatabase] = React.useState({
    value: initialDb,
    label: initialDb,
  });

  const getOptions = () => {
    const databases = localStorage.getItem("available_databases").split(",");
    return databases.map((dbName) => {
      return { value: dbName, label: dbName };
    });
  };

  const onSave = () => {
    localStorage.setItem("selected_database", database.value);
    handleClose();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "black" }}>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ color: "black" }}>
          <Form.Group controlId="formBasicSelect">
            <Form.Label>Select Database</Form.Label>
            <Select
              className="form-control select"
              aria-label="Default select example"
              options={getOptions()}
              defaultValue={database}
              onChange={(value) => setDatabase(value)}
            />
          </Form.Group>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={onSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal.Body>
      </Modal>
    </>
  );
}
