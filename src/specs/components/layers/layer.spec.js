import Layer  from './../../../components/layers/layer';
import React from 'react';
import { shallow } from './../../enzyme';


describe('<Layer />', () => {
    let wrapper;
    var ukey = "akey";
    
    beforeEach(() => {
	wrapper = shallow(<Layer ukey={ukey} />);
    });
    
    it('render the component', () => {
	expect(wrapper).toBeTruthy();
    });

    it('Layer change name', () => {
	var identifier = '[name="name"]';
	var input = wrapper.find(identifier);
	var text = "newValue";
	input.simulate('change', { target: {value: text }});
	expect(wrapper.state().name).toEqual(text);
    });

    it('Layer change lat property', () => {
	var identifier = '[name="latitudeProperty"]';
	var input = wrapper.find(identifier);
	var text = "newValue";
	input.simulate('change', { value: text, label: text });
	expect(wrapper.state().latitudeProperty.value).toEqual(text);
    });

    it('Layer change lon property', () => {
	var identifier = '[name="longitudeProperty"]';
	var input = wrapper.find(identifier);
	var text = "newValue";
	input.simulate('change', {value: text, label: text });
	expect(wrapper.state().longitudeProperty.value).toEqual(text);
    });

    it('Layer change tooltip property', () => {
	var identifier = '[name="tooltipProperty"]';
	var input = wrapper.find(identifier);
	var text = "newValue";
	input.simulate('change', {value: text, label: text });
	expect(wrapper.state().tooltipProperty.value).toEqual(text);
    });

    it('Layer change limit', () => {
	var identifier = '[name="limit"]';
	var input = wrapper.find(identifier);
	var text = 10;
	input.simulate('change', { target: {value: text }});
	expect(wrapper.state().limit).toEqual(text);
    });

    it('Layer change color', () => {
	var identifier = '[name="color"]';
	var input = wrapper.find(identifier);
	input.simulate('change', {value: "yellow", label: "Yellow" });
	expect(wrapper.state().color.value).toEqual("yellow");
	expect(wrapper.state().color.label).toEqual("Yellow");
    });

    it('Layer change layer type latlon', () => {
	var identifier = '[name="layerTypeLatLon"]';
	var checkbox = wrapper.find(identifier);
	checkbox.simulate('change', { target: {value: "latlon" }});
	expect(wrapper.state().layerType).toEqual("latlon");
    });

    it('Layer change layer type cypher', () => {
	var identifier = '[name="layerTypeCypher"]';
	var checkbox = wrapper.find(identifier);
	checkbox.simulate('change', { target: {value: "cypher" }});

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
	var identifier = '[name="mapRenderingHeatmap"]';
	var checkbox = wrapper.find(identifier);
	checkbox.simulate('change', { target: {value: "heatmap" }});

	// rendering state is heatmap
	expect(wrapper.state().rendering).toEqual("heatmap");

	// radius input is visible
	expect(wrapper.exists('[name="radius"]')).toEqual(true);

	// marker color and tooltip are hidden
	expect(wrapper.find('[name="formgroupColor"]').props()['hidden']).toBe(true);
	expect(wrapper.find('[name="formgroupTooltip"]').props()['hidden']).toBe(true);
    });
    
});
