/**Simple Layer definition
 */
import React, {Component} from 'react';
import {Form} from 'react-bootstrap';
import Select from 'react-select'
import {RENDERING_MARKERS} from '../../constants'


const DEFAULT_CONFIG = {
	spatialLayer: "",
	tooltipProperty: {value: "id", label: "id"},
};


class SpatialLayer extends Component {

	constructor(props) {
		super(props);

		this.state = DEFAULT_CONFIG;
		this.state["limit"] = props.limit;
		this.state["spatialLayers"] = this.getSpatialLayers();
		this.state["rendering"] = props.rendering;

		this.driver = props.driver;

		this.handleSpatialLayerChange = this.handleSpatialLayerChange.bind(this);

	};


	getSpatialLayers() {
		if (this.driver === undefined)
			return [];

		var res = [];
		const session = this.driver.session();
		var query = "CALL spatial.layers();";
		session
			.run(
				query
			)
			.then(function (result) {
				result.records.forEach(function (record) {
					var el = {
						value: record.get("name"),
						label: record.get("name")
					};
					res.push(el);
				});
				session.close();
			})
			.catch(function (error) {
				console.log(error);
				return undefined;
			});
		return res;
	};


	handleSpatialLayerChange(e) {
		this.setState({spatialLayer: e});
	};


	getQuery() {
		var query = `CALL spatial.layer('${this.state.spatialLayer.value}') YIELD node `;
		query += "WITH node ";
		query += "MATCH (node)-[]-()-[:RTREE_REFERENCE]-(n) ";
		query += "RETURN n.latitude as latitude, n.longitude as longitude ";
		if (this.state.tooltipProperty !== '')
			query += `, n.${this.state.tooltipProperty.value} as tooltip`;
		query += `\nLIMIT ${this.state.limit}`;
		return query;
	};


	render() {
		return (
			<div>
				<Form.Group controlId="formSpatialLayer" name="formgroupSpatialLayer">
					<Form.Label>Spatial layer</Form.Label>
					<Select
						className="form-control select"
						options={this.state.spatialLayers}
						onChange={this.handleSpatialLayerChange}
						isMulti={false}
						defaultValue={this.state.spatialLayer}
						name="spatialLayer"
					/>
				</Form.Group>

				<Form.Group controlId="formTooltipProperty" hidden={(this.state.rendering !== RENDERING_MARKERS)}
							name="formgroupTooltip">
					<Form.Label>Tooltip property</Form.Label>
					<Select
						className="form-control select"
						options={this.state.labels}
						onChange={this.handleTooltipPropertyChange}
						isMulti={false}
						defaultValue={this.state.tooltipProperty}
						name="tooltipProperty"
					/>

				</Form.Group>
				<Form.Group controlId="formLimit">
					<Form.Label>Max. nodes</Form.Label>
					<Form.Text>
						<p className="font-italic">Be careful, the browser can only display a limited number of nodes
							(less than a few 10000)</p>
					</Form.Text>
					<Form.Control
						type="text"
						className="form-control"
						placeholder="limit"
						defaultValue={this.state.limit}
						onChange={this.handleLimitChange}
						name="limit"
					/>
				</Form.Group>
			</div>
		)
	}
}


export default SpatialLayer;
