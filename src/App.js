import React, { Component } from "react";
import "./App.css";
import Map from "./components/Map";
import {DEFAULT_LAYER}  from "./components/layers/layer"
import SideBar from "./components/SideBar";

const neo4j = require("neo4j-driver/lib/browser/neo4j-web.min.js").v1;


class App extends Component {

  constructor(props) {
    super(props);

    var default_layer = DEFAULT_LAYER;
    var uid = (new Date().getTime()).toString(36);
    default_layer["key"] = uid;
    var layers = {
//      [uid]: default_layer
    };
   this.state = {
      latitude: 47,
      longitude: 3,
      layers: layers
    };

    this.driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "admin"));

  };

  componentWillUnmount() {
    this.driver.close();
  }

  getNodes() {
    var res = [];
    const session = this.driver.session();
    session
      .run(
        `MATCH (n) WITH labels(n) as labs UNWIND labs as l RETURN distinct l as label`,
      )
      .then(function (result) {
        result.records.forEach(function (record) {
          var el = {
            value:record.get("label"),
            label: record.get("label")
          };
          res.push(el);
        });
        session.close();
      })
      .catch(function (error) {
        console.log(error);
      });
    return res;
  };

  layersChanged = (childData) => {
    this.setState({
      layers: childData.layers
    });
  };

  render() {
    return (
        <div id="wrapper" className="row">
            <div id="sidebar" className="col-md-4">
            <SideBar
                layersChanged = {this.layersChanged}
                nodes = {this.getNodes()}
                layers = {this.state.layers}
                driver = {this.driver}
             />
            </div>
            <div id="app-maparea" className="col-md-8">
            <Map
               layers = {this.state.layers}
            />
            </div>
     </div>
    );
  }
}


export default App;
