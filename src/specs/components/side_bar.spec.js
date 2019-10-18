import SideBar from './../../components/SideBar';
import React from 'react';
import { shallow } from './../enzyme';

describe('<SideBar />', () => {
  it('render the component', () => {
    const wrapper = shallow(<SideBar />);

    expect(wrapper).toBeTruthy();
  });
});
