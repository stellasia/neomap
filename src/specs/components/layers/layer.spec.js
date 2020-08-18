import React from 'react';
import { Layer } from '../../../components/layers/Layer';
import { shallow } from './../../enzyme';


describe('Test Layer component', () => {
	let wrapper;
	let ukey = "akey";

	beforeEach(() => {
		wrapper = shallow(<Layer ukey={ukey}/>);
	});

	it('render the component', () => {

		expect(wrapper).toBeTruthy();
	});

	it('Layer change name', () => {
		let identifier = '[name="name"]';
		let input = wrapper.find(identifier);
		let text = "newValue";
		input.simulate('change', {target: {value: text}});
		expect(wrapper.state().name).toEqual(text);
	});

	it('Layer change lat property', () => {
		let identifier = '[name="latitudeProperty"]';
		let input = wrapper.find(identifier);
		let text = "newValue";
		input.simulate('change', {value: text, label: text});
		expect(wrapper.state().latitudeProperty.value).toEqual(text);
	});

	it('Layer change lon property', () => {
		let identifier = '[name="longitudeProperty"]';
		let input = wrapper.find(identifier);
		let text = "newValue";
		input.simulate('change', {value: text, label: text});
		expect(wrapper.state().longitudeProperty.value).toEqual(text);
	});

	it('Layer change tooltip property', () => {
		let identifier = '[name="tooltipProperty"]';
		let input = wrapper.find(identifier);
		let text = "newValue";
		input.simulate('change', {value: text, label: text});
		expect(wrapper.state().tooltipProperty.value).toEqual(text);
	});

	it('Layer change limit', () => {
		let identifier = '[name="limit"]';
		let input = wrapper.find(identifier);
		let text = 10;
		input.simulate('change', {target: {value: text}});
		expect(wrapper.state().limit).toEqual(text);
	});

	it('Layer change layer type latlon', () => {
		let identifier = '[name="layerTypeLatLon"]';
		let checkbox = wrapper.find(identifier);
		checkbox.simulate('change', {target: {value: "latlon"}});
		expect(wrapper.state().layerType).toEqual("latlon");
	});

	it('Layer change layer type cypher', () => {
		let identifier = '[name="layerTypeCypher"]';
		let checkbox = wrapper.find(identifier);
		checkbox.simulate('change', {target: {value: "cypher"}});

		// layer type is cypher
		expect(wrapper.state().layerType).toEqual("cypher");

		// cypher editor is visible
		expect(wrapper.exists('[name="cypher"]')).toEqual(true);

		// lat/lon properties are hidden
		expect(wrapper.exists('[name="latitudeProperty"]')).toEqual(false);
		expect(wrapper.exists('[name="longitudeProperty"]')).toEqual(false);
		expect(wrapper.exists('[name="nodeLabel"]')).toEqual(false);

		// this.state.cypher is not ""
		expect(wrapper.state().cypher).not.toEqual("");
	});


	it('Layer change rendering heatmap', () => {
		let identifier = '[name="mapRenderingHeatmap"]';
		let checkbox = wrapper.find(identifier);
		checkbox.simulate('change', {target: {value: "heatmap"}});

		// rendering state is heatmap
		expect(wrapper.state().rendering).toEqual("heatmap");

		// radius input is visible
		expect(wrapper.exists('[name="radius"]')).toEqual(true);

		// marker color and tooltip are hidden
		expect(wrapper.find('[name="formgroupColor"]').props()['hidden']).toBe(true);
		expect(wrapper.find('[name="formgroupTooltip"]').props()['hidden']).toBe(true);
	});

});
