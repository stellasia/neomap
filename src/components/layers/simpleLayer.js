/**Simple Layer definition
 */
import React, {Component} from 'react';
import {Form} from 'react-bootstrap';
import Select from 'react-select'
import {RENDERING_MARKERS} from '../../constants'


class SimpleLayer extends Component {

	constructor(props) {
		super(props);

		this.state = props;

		this.driver = props.driver;

		// list of available nodes
		this.state.nodes = this.getNodes();
		this.state.labels = this.getLabels();

		this.handleNodeLabelChange = this.handleNodeLabelChange.bind(this);
		this.handleLatPropertyChange = this.handleLatPropertyChange.bind(this);
		this.handleLonPropertyChange = this.handleLonPropertyChange.bind(this);
		this.handleTooltipPropertyChange = this.handleTooltipPropertyChange.bind(this);
		this.handleLimitChange = this.handleLimitChange.bind(this);
		this.handleColorChange = this.handleColorChange.bind(this);

	};


	getNodeFilter() {
		var filter = '';
		// filter wanted node labels
		if (this.state.nodeLabel !== null && this.state.nodeLabel.length > 0) {
			var sub_q = "(false";
			this.state.nodeLabel.forEach((value, key) => {
				let lab = value.label;
				sub_q += ` OR n:${lab}`;
			});
			sub_q += ")";
			filter += "\nAND " + sub_q;
		}
		return filter;
	};


	getQuery() {
		// TODO: improve this method...
		var query = 'MATCH (n) WHERE true';
		// filter wanted node labels
		query += this.getNodeFilter();
		// filter out nodes with null latitude or longitude
		query += `\nAND exists(n.${this.state.latitudeProperty.value}) AND exists(n.${this.state.longitudeProperty.value})`;
		// return latitude, longitude
		query += `\nRETURN n.${this.state.latitudeProperty.value} as latitude, n.${this.state.longitudeProperty.value} as longitude`;

		// if tooltip is not null, also return tooltip
		if (this.state.tooltipProperty !== '')
			query += `, n.${this.state.tooltipProperty.value} as tooltip`;

		// TODO: is that really needed???
		// limit the number of points to avoid browser crash...
		query += `\nLIMIT ${this.state.limit}`;

		return query;
	};


	handleLimitChange(e) {
		this.setState({limit: e.target.value});
	};


	handleLatPropertyChange(e) {
		this.setState({latitudeProperty: e});
	};


	handleLonPropertyChange(e) {
		this.setState({longitudeProperty: e});
	};


	handleTooltipPropertyChange(e) {
		this.setState({tooltipProperty: e});
	};


	handleNodeLabelChange(e) {
		this.setState({nodeLabel: e}, function () {
				this.setState({labels: this.getLabels()})
			}
		);
	};


	handleColorChange(e) {
		this.setState({
			color: e,
		});
	};


	getNodes() {
		/*This will be updated quite often,
           is that what we want?

           TODO: use apoc procedure for that, the query below can be quite loong...
         */
		if (this.driver === undefined)
			return [];

		var res = [];
		const session = this.driver.session();
		session
			.run(
				`MATCH (n) WITH labels(n) as labs UNWIND labs as l RETURN distinct l as label`,
			)
			.then(function (result) {
				result.records.forEach(function (record) {
					var el = {
						value: record.get("label"),
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


	getLabels() {
		/*This will be updated quite often,
           is that what we want?

           TODO: use apoc procedure for that, the query below can be quite loong...
         */
		if (this.driver === undefined)
			return [];

		var res = [];
		const session = this.driver.session();
		var query = "";
		if (this.state.nodeLabel !== null && this.state.nodeLabel.length > 0) {
			query += "MATCH (n) WHERE true ";
			query += this.getNodeFilter();
			query += " WITH n LIMIT 100 UNWIND keys(n) AS key RETURN DISTINCT key AS propertyKey";
		} else {
			query = "CALL db.propertyKeys()"
		}
		session
			.run(
				query
			)
			.then(function (result) {
				result.records.forEach(function (record) {
					var el = {
						value: record.get("propertyKey"),
						label: record.get("propertyKey")
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


	render() {

		return (
			<div>
				<Form.Group controlId="formNodeLabel">
					<Form.Label>Node label(s)</Form.Label>
					<Select
						className="form-control select"
						options={this.state.nodes}
						onChange={this.handleNodeLabelChange}
						isMulti={true}
						defaultValue={this.state.nodeLabel}
						name="nodeLabel"
					/>
				</Form.Group>

				<Form.Group controlId="formLatitudeProperty">
					<Form.Label>Latitude property</Form.Label>
					<Select
						className="form-control select"
						options={this.state.labels}
						onChange={this.handleLatPropertyChange}
						isMulti={false}
						defaultValue={this.state.latitudeProperty}
						name="latitudeProperty"
					/>
				</Form.Group>

				<Form.Group controlId="formLongitudeProperty">
					<Form.Label>Longitude property</Form.Label>
					<Select
						className="form-control select"
						options={this.state.labels}
						onChange={this.handleLonPropertyChange}
						isMulti={false}
						defaultValue={this.state.longitudeProperty}
						name="longitudeProperty"
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

		);
	}
}


export default SimpleLayer;
