import Map from './../../components/Map';
import React from 'react';
import { shallow } from './../enzyme';

describe('<Map />', () => {
  it('render the component', () => {
    const wrapper = shallow(<Map layers={{}} />);

    expect(wrapper).toBeTruthy();
  });
});
