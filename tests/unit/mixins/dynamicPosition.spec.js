import Vue from 'vue';
import * as bodyScrollLockFunctions from 'body-scroll-lock';
import { shallowMount } from '@vue/test-utils';
import dynamicPosition from '@/mixins/dynamicPosition';

import * as utilsFunctions from '@/utils';

jest.mock('body-scroll-lock', () => ({
  disableBodyScroll: jest.fn(),
  enableBodyScroll: jest.fn(),
  clearAllBodyScrollLocks: jest.fn(),
}));

describe('DatePickerAgenda', () => {
  let mountComponent;
  const EmptyComponent = Vue.component('empty-component', {
    mixins: [dynamicPosition],
    props: ['fullscreenMobile', 'isVisible'],
    template: '<div></div>',
  });

  beforeEach(() => {
    jest.spyOn(utilsFunctions, 'computePositionFromParent').mockReturnValue({
      top: 0,
      left: 0,
      origin: 'origin',
    });
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
    mountComponent = ({
      fullscreenMobile = false,
      isVisible = false,
    } = {}) => shallowMount(EmptyComponent, {
      propsData: {
        fullscreenMobile,
        isVisible,
      },
    });
  });

  afterEach(() => {
    window.requestAnimationFrame.mockRestore();
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('Should init data', () => {
    const wrapper = mountComponent();
    expect(wrapper.isVueInstance()).toBeTruthy();
    expect(wrapper.vm.offset).toEqual(28);
    expect(wrapper.vm.left).toEqual(0);
    expect(wrapper.vm.top).toEqual(0);
    expect(wrapper.vm.origin).toEqual('top center');
  });

  describe('computed', () => {
    describe('styles', () => {
      it('should return styles from data', () => {
        const wrapper = mountComponent();
        expect(wrapper.vm.styles).toEqual({
          top: '0px',
          left: '0px',
          transformOrigin: 'top center',
        });
      });
    });
  });

  describe('mounted', () => {
    beforeEach(() => {
      jest.spyOn(window, 'addEventListener').mockImplementation((type, cb) => cb());
      jest.spyOn(window, 'removeEventListener');
    });

    it('should init listeners', () => {
      const wrapper = mountComponent();
      jest.spyOn(wrapper.vm, 'updatePosition').mockReturnValue(true);

      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      global.innerWidth = 1000;
      // expect(wrapper.vm.updatePosition).toHaveBeenCalled();

      wrapper.destroy();
      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('methods', () => {
    describe('updatePosition', () => {
      it('should call computePositionFromParent & update windowWidth', () => {
        const wrapper = mountComponent();

        wrapper.vm.updatePosition();
        expect(utilsFunctions.computePositionFromParent).toHaveBeenCalled();
      });

      it('should lock body scroll if fullscreenMobile equal true & innerWidth < 768', () => {
        const wrapper = mountComponent({ fullscreenMobile: true, isVisible: true });
        global.innerWidth = 479;
        wrapper.vm.updatePosition();

        expect(bodyScrollLockFunctions.disableBodyScroll).toHaveBeenCalledWith(wrapper.element);

        global.innerWidth = 1000;
        wrapper.vm.updatePosition();

        expect(bodyScrollLockFunctions.enableBodyScroll).toHaveBeenCalledWith(wrapper.element);
      });
    });
  });
});
