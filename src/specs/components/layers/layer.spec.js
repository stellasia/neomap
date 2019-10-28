import Layer from './../../../components/layers/layer';
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

    it('Layer change lat property', () => {
	var identifier = "#latitutdePropertyID-" + ukey;
	var input = wrapper.find(identifier);
	var text = "newValue";
	input.simulate('change',  { target: {value: text }});
	expect(wrapper.state().latitudeProperty).toEqual(text);
    });

    it('Layer change lon property', () => {
	var identifier = "#longitudePropertyID-" + ukey;
	var input = wrapper.find(identifier);
	var text = "newValue";
	input.simulate('change',  { target: {value: text }});
	expect(wrapper.state().longitudeProperty).toEqual(text);
    });
    
});
