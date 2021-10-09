import React from "react";
import { Modal, Button } from "react-bootstrap";
import Select from "react-select";
import Form from "react-bootstrap/Form";

export default function SettingsModal({ handleClose, show }) {
  const initialDb = localStorage.getItem("selected_database") || "neo4j";
  const initialLatProperty = localStorage.getItem("default_lat") || "lat";
  const initialLonProperty = localStorage.getItem("default_lon") || "lon";
  const initialShowDirections = localStorage.getItem("show_directions") || "true";
  const [database, setDatabase] = React.useState({ value: initialDb, label: initialDb });
  const [defaultLatProperty, setDefaultLatProperty] = React.useState(initialLatProperty);
  const [defaultLonProperty, setDefaultLonProperty] = React.useState(initialLonProperty);
  const [showDirections, setShowDirections] = React.useState(initialShowDirections === "true");

  const getOptions = () => {
    const databases = (localStorage.getItem("available_databases") || "").split(",");
    return databases.map((dbName) => {
      return { value: dbName, label: dbName };
    });
  };

  const onSave = () => {
    localStorage.setItem("selected_database", database.value);
    localStorage.setItem("default_lat", defaultLatProperty);
    localStorage.setItem("default_lon", defaultLonProperty);
    localStorage.setItem("show_directions", showDirections);
    handleClose();
  };

  const cleanUpModal = () => {
    setDatabase({ value: initialDb, label: initialDb });
    setDefaultLonProperty(initialLonProperty);
    setDefaultLatProperty(initialLatProperty);
    setShowDirections(initialShowDirections === "true")
  };

  const onClose = () => {
    cleanUpModal();
    handleClose();
  };
  console.log(showDirections);
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Settings</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="databaseSelect">
          <Form.Label>Select Database</Form.Label>
          <Select
            className="form-control select"
            aria-label="Database select"
            options={getOptions()}
            defaultValue={database}
            onChange={(value) => setDatabase(value)}
          />
        </Form.Group>
        <Form.Group controlId="defaultLatProperty">
          <Form.Label>Default Latitude property</Form.Label>
          <Form.Control
            type="text"
            defaultValue={defaultLatProperty}
            onChange={(e) => setDefaultLatProperty(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="defaultLonProperty">
          <Form.Label>Default Longitude property</Form.Label>
          <Form.Control
            type="text"
            defaultValue={defaultLonProperty}
            onChange={(e) => setDefaultLonProperty(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="showDirections">
          <Form.Label>Show directions</Form.Label>
          <Form.Check
            type="switch"
            defaultChecked={showDirections}
            onChange={(e) => setShowDirections(e.target.checked)}
          />
        </Form.Group>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  );
}
