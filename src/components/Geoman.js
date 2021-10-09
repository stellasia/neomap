import "@geoman-io/leaflet-geoman-free";

export default function initGeoman(map) {
  map.pm.addControls({
    drawRectangle: true,
    removalMode: true,
    editMode: true,
    dragMode: true,
    drawMarker: false,
    drawPolyline: false,
    drawCircle: false,
    drawCircleMarker: false,
    drawPolygon: false,
    cutPolygon: false,
    rotateMode: false,
  });

  const setRectangleCoordinates = () => {
    const coords = map.pm
      .getGeomanDrawLayers(true)
      .toGeoJSON()
      .features.flatMap((f) => {
        return f.geometry.coordinates;
      });
    localStorage.setItem("rectangle_coordinates", JSON.stringify(coords));
  };

  map.on("pm:drawstart", () => {
    const layers = map.pm.getGeomanDrawLayers();
    if (layers.length > 1) {
      window.alert("Using more than two shapes leads to performance issues with Neo4j.");
      map.pm.disableDraw();
    }
  });

  // listen to `create` and `remove` events and update rectangle coordinates in local storage
  map.on("pm:create", (e) => {
    if (e.layer && e.layer.pm) {
      setRectangleCoordinates();
      // also need to add listener for a new layer
      e.layer.on("pm:edit", (e) => {
        setRectangleCoordinates();
      });
    }
  });

  map.on("pm:remove", (e) => {
    setRectangleCoordinates();
  });
}
