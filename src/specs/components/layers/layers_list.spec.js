import LayersList from './../../../components/layers/layers_list';
import React from 'react';
import { shallow } from './../../enzyme';

describe('<LayersList />', () => {
  it('render the component', () => {
    const wrapper = shallow(<LayersList layers={[]} />);

    expect(wrapper).toBeTruthy();
  });

  describe('renderLayers', () => {
    const amountOfLayers = [1,5,10];

    amountOfLayers.forEach(amount => {
      describe(`when have ${amount} layers`, () => {
        it(`render ${amount} layers`, () => {
          const layers = Array(amount).fill([
            'key',
            {
              ukey: 'ukey'
            }
          ])

          const wrapper = shallow(<LayersList layers={layers} />);
          const layersComponent = wrapper.find('Layer[data-id="layers"]');

          expect(layersComponent.length).toEqual(amount);
        });
      });
    });
  });

  describe('renderNewLayer', () => {
    it('always render 1 new layer', () => {
      const wrapper = shallow(<LayersList layers={[]} />);
      const newLayersComponent = wrapper.find('Layer[data-id="new-layer"]');

      expect(newLayersComponent.length).toEqual(1);
    });
  });
});
