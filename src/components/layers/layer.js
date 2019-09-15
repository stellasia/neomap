import React, { Component } from 'react';
import Select from 'react-select'


const LIMIT = 500;

const POSSIBLE_COLORS = [
  {value: "blue", label: "Blue"},
  {value: "red", label: "Red"},
  {value: "green", label: "Green"},
  {value: "orange", label: "Orange"},
  {value: "yellow", label: "Yellow"},
  {value: "violet", label: "Violet"},
  {value: "grey", label: "Grey"},
  {value: "black", label: "Black"}
];

const DEFAULT_LAYER = {
  name: "New layer",
  latProperty: "latitude",
  lonProperty: "longitude",
  nodeLabel: [],
  hidden: false,
  data: [],
  position: [],
  color: "blue",
  colorName: "Blue"
}


class Layer extends Component {

  constructor(props) {
    super(props);

    if (props.layer !== undefined) {
      this.state = {
        key: props.layer.key,
        name: props.layer.name,
        latProperty: props.layer.latProperty,
        lonProperty: props.layer.lonProperty,
        nodeLabel: props.layer.nodeLabel,
        hidden: props.layer.hidden,
        data: props.layer.data,
        position: props.layer.position,
        color: props.layer.color,
        colorName: props.layer.colorName
      };
    } else {
      this.state = DEFAULT_LAYER;
      var uid = (new Date().getTime()).toString(36);
      this.state["key"] = uid;
    }

    this.nodes = props.nodes;
    this.driver = props.driver;

    this.sendData = this.sendData.bind(this);
    this.handleLatPropertyChange = this.handleLatPropertyChange.bind(this);
    this.handleLonPropertyChange = this.handleLonPropertyChange.bind(this);
    this.handleNodeLabelChange = this.handleNodeLabelChange.bind(this);
    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleHiddenStateChange = this.handleHiddenStateChange.bind(this);
    this.handleColorChange = this.handleColorChange.bind(this);

    this.updateData = this.updateData.bind(this);
    this.updatePosition = this.updatePosition.bind(this);
  };


  updatePosition() {
    var arr = this.state.data;
    var pos = [47, 3];
    if (arr.length > 0) {
      var latMean = 0;
      var lonMean = 0;
      arr.map( (item, i) => {
        var lat = item[0];
        var lon = item[1];
        latMean += parseFloat(lat);
        lonMean += parseFloat(lon);
        return undefined;
      });
      latMean = latMean / arr.length;
      lonMean = lonMean / arr.length;
      pos = [latMean, lonMean];
    }
    this.setState({position: pos}, function() {
      this.props.sendData({
        key: this.state.key,
        layer: this.state
      });
    });
  };

  updateData() {
    var res = [];
    const session = this.driver.session();
    var nodeLabel = this.state.nodeLabel.join("|");
    var query = "";
    if (nodeLabel !== "") {
      query = `MATCH (n:${nodeLabel})`;
    } else {
      query = 'MATCH (n)';
    }
    query += `WHERE n.${this.state.latProperty} IS NOT NULL AND n.${this.state.lonProperty} IS NOT NULL RETURN n.${this.state.latProperty} as latitude, n.${this.state.lonProperty} as longitude LIMIT ${LIMIT}`;
    var params = {};
    session
      .run(
        query, params
      )
      .then(result => {
        result.records.forEach(function (record) {
          var el = [
            record.get("latitude"),
            record.get("longitude")
          ];
          res.push(el);
        });
      this.setState({data: res}, function() {this.updatePosition()});
      session.close();
    })
    .catch(function (error) {
      console.log(error);
    });
  };

  handleLatPropertyChange(e) {    
    this.setState({latProperty: e.target.value});
  };

  handleLonPropertyChange(e) {
    this.setState({lonProperty: e.target.value});
  };

  handleNodeLabelChange(e) {
    if (e === null)
      return null;
    var labels = [];
    e.map(function(label) {
      labels.push(label.label);
      return undefined;
    });
    this.setState({nodeLabel: labels});
  };

  handleNameChange(e) {
    this.setState({name: e.target.value});
  };

  handleHiddenStateChange(e) {
    this.setState({hidden: e.target.checked});
  };

  handleColorChange(e) {
    this.setState({color: e.value});
  };

  sendData(event) {
    this.updateData();
    event.preventDefault();
  };


  render() {

    var selectedNodes = [];
    this.nodes.map((value) => {
      this.state.nodeLabel.map((value2) => {
        if (value.value === value2)
          selectedNodes.push(value);
        return null
      });
      return null
    });

    return (
<div>
   <form action="" >
    <h4>{this.state.name} <small>({this.state.key})</small></h4>

  <div className="form-group">
    <h5>Name</h5>
    <input
      type="text"
      id="nameprop"
      className="form-control"
      placeholder="Layer name"
      defaultValue={this.state.name}
      onChange={this.handleNameChange}
    />
  </div>

  <div className="form-group">        
    <h5>Node label</h5>
    <Select
      className="form-control select"
      options={this.nodes}
      onChange={this.handleNodeLabelChange}
      isMulti={true}
      defaultValue={selectedNodes}
    />
  </div>

  <div className="form-group">
    <h5>Latitude property</h5>
    <input
      type="text"
      id="latprop"
      className="form-control"
      placeholder="latitude"
      defaultValue={this.state.latProperty}
      onChange={this.handleLatPropertyChange}
    />
  </div>

  <div className="form-group">
    <h5>Longitude property</h5>
    <input
      type="text"
      id="lonprop"
      className="form-control"
      placeholder="longitude"
      defaultValue={this.state.lonProperty}
      onChange={this.handleLonPropertyChange}
    />
  </div>

  <div className="form-group">
    <input
      type="checkbox"
      id="hiddenprop"
      className="form-check-input"
      defaultValue={this.state.hidden}
      onChange={this.handleHiddenStateChange}
      checked ={this.state.hidden}
    />
    <label htmlFor="hiddenprop">Hide</label>
  </div>

  <div className="form-group">        
    <h5>Color</h5>
    <Select
      className="form-control select"
      options={POSSIBLE_COLORS}
      defaultValue={{value: this.state.color, label: this.state.colorName}}
      onChange={this.handleColorChange}
    />
  </div>

  <input type="submit" className="btn btn-info" value="Update map >" onClick={this.sendData} />

</form>
</div>

    );
  }
}

export {Layer,  DEFAULT_LAYER};