import React from 'react';
import { render, cleanup } from '@testing-library/react'
import { Layer, NEW_LAYER } from './Layer';

describe('Test Layer component', () => {
	let renderResult;
	let ukey = "akey";

	beforeEach(() => {
		renderResult = render(<Layer ukey={ukey}/>);
	});

	it('renders the layer', () => {
		expect(renderResult.container).toBeDefined();
	});

	it('Layer change name', () => {
		let identifier = '[name="name"]';
		let input = renderResult.getByPlaceholderText('Layer name');
		let text = "newValue";
		input.simulate('change', {target: {value: text}});
		expect(renderResult.state().name).toEqual(text);
	});

	it('Layer change lat property', () => {
		let identifier = '[name="latitudeProperty"]';
		let input = renderResult.find(identifier);
		let text = "newValue";
		input.simulate('change', {value: text, label: text});
		expect(renderResult.state().latitudeProperty.value).toEqual(text);
	});

	it('Layer change lon property', () => {
		let identifier = '[name="longitudeProperty"]';
		let input = renderResult.find(identifier);
		let text = "newValue";
		input.simulate('change', {value: text, label: text});
		expect(renderResult.state().longitudeProperty.value).toEqual(text);
	});

	it('Layer change tooltip property', () => {
		let identifier = '[name="tooltipProperty"]';
		let input = renderResult.find(identifier);
		let text = "newValue";
		input.simulate('change', {value: text, label: text});
		expect(renderResult.state().tooltipProperty.value).toEqual(text);
	});

	it('Layer change limit', () => {
		let identifier = '[name="limit"]';
		let input = renderResult.find(identifier);
		let text = 10;
		input.simulate('change', {target: {value: text}});
		expect(renderResult.state().limit).toEqual(text);
	});

	it('Layer change layer type latlon', () => {
		let identifier = '[name="layerTypeLatLon"]';
		let checkbox = renderResult.find(identifier);
		checkbox.simulate('change', {target: {value: "latlon"}});
		expect(renderResult.state().layerType).toEqual("latlon");
	});

	it('Layer change layer type cypher', () => {
		let identifier = '[name="layerTypeCypher"]';
		let checkbox = renderResult.find(identifier);
		checkbox.simulate('change', {target: {value: "cypher"}});

		// layer type is cypher
		expect(renderResult.state().layerType).toEqual("cypher");

		// cypher editor is visible
		expect(renderResult.exists('[name="cypher"]')).toEqual(true);

		// lat/lon properties are hidden
		expect(renderResult.exists('[name="latitudeProperty"]')).toEqual(false);
		expect(renderResult.exists('[name="longitudeProperty"]')).toEqual(false);
		expect(renderResult.exists('[name="nodeLabel"]')).toEqual(false);

		// this.state.cypher is not ""
		expect(renderResult.state().cypher).not.toEqual("");
	});


	it('Layer change rendering heatmap', () => {
		let identifier = '[name="mapRenderingHeatmap"]';
		let checkbox = renderResult.find(identifier);
		checkbox.simulate('change', {target: {value: "heatmap"}});

		// rendering state is heatmap
		expect(renderResult.state().rendering).toEqual("heatmap");

		// radius input is visible
		expect(renderResult.exists('[name="radius"]')).toEqual(true);

		// marker color and tooltip are hidden
		expect(renderResult.find('[name="formgroupColor"]').props()['hidden']).toBe(true);
		expect(renderResult.find('[name="formgroupTooltip"]').props()['hidden']).toBe(true);
	});

	afterEach(() => {
		cleanup();
	});
});
