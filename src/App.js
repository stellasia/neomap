import React from "react";
import download from "downloadjs";
import { Map } from "./components/Map";
import { Menu } from "./components/Menu";
import { SideBar } from "./components/SideBar";
import { neo4jService } from "./services/neo4jService";
import "./App.css";

export const App = React.memo(() => {
  /**
   * Given the underlying neo4jDesktop drivers' dependency on global window context,
   * we need to import an instance here to the boot a service instance that reads
   * App.js window instance. The service is a singleton,
   * and subsequent windows will get the same instance with drivers created here.
   *
   * TODO: FIXME! Redesign neo4jService instantiation with full consideration for global window dependency
   */
  neo4jService._getNeo4jDriver();

  React.useEffect(() => {
    // on App component mount clear coordinates of shapes that could've been drawn during previous session
    localStorage.removeItem("rectangle_coordinates");
  }, []);

  const defaultMapOffset = 30;
  const calcOffset = () => {
    // guarantees 60px wide sidebar
    return (60 / window.innerWidth) * 100 - defaultMapOffset;
  };

  const [layers, setLayers] = React.useState([]);
  const [collapsed, setCollapse] = React.useState(false);
  const [hiddenSidebarOffset, setHiddenSidebarOffset] = React.useState(calcOffset());

  const addLayer = (layer) => {
    setLayers([...layers, layer]);
  };

  const updateLayer = (layer) => {
    const updatedLayers = layers.map((currentLayer) => {
      if (currentLayer.ukey === layer.ukey) {
        return layer;
      }
      return currentLayer;
    });

    setLayers(updatedLayers);
  };

  const removeLayer = (key) => {
    const filteredLayers = layers.filter((layer) => layer.ukey !== key);

    setLayers(filteredLayers);
  };

  const saveConfigToFile = (e) => {
    const config = JSON.stringify(layers);
    const fileName = "neomap_config.json";
    download(config, fileName, "application/json");
    e.preventDefault();
  };

  const loadConfigFromFile = (e) => {
    const fileSelector = document.createElement("input");
    fileSelector.setAttribute("type", "file");
    fileSelector.click();
    fileSelector.onchange = (ev) => {
      const file = ev.target.files[0];
      const fileReader = new FileReader();
      fileReader.onloadend = (e) => {
        const content = e.target.result;
        try {
          const loadedLayers = JSON.parse(content);
          setLayers(loadedLayers);
        } catch (err) {
          // TODO: Build error UI
          console.log("Failed to load and parse data from file", err);
        }
      };
      fileReader.readAsText(file);
    };
    e.preventDefault();
  };

  React.useEffect(() => {
    const handleResize = () => setHiddenSidebarOffset(calcOffset());

    window.addEventListener("resize", handleResize);
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarOffset = collapsed ? hiddenSidebarOffset : 0;
  const mapOffset = defaultMapOffset + sidebarOffset;
  const mapWidth = 100 - mapOffset;

  const toggleCollapse = () => {
    setCollapse(!collapsed);
  };

  return (
    <div id="wrapper" className="row">
      <div id="sidebar" className="col" style={{ left: `${sidebarOffset}%` }}>
        <Menu
          saveConfigToFile={saveConfigToFile}
          loadConfigFromFile={loadConfigFromFile}
          toggleCollapse={toggleCollapse}
          collapsed={collapsed}
        />
        <SideBar layers={layers} addLayer={addLayer} updateLayer={updateLayer} removeLayer={removeLayer} />
      </div>
      <div id="app-maparea" className="col" style={{ left: `${mapOffset}%`, width: `${mapWidth}%` }}>
        <Map key="map" layers={layers} sideBarCollapsed={collapsed} />
      </div>
    </div>
  );
});
