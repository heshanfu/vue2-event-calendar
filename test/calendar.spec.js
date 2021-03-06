import { shallow } from '@vue/test-utils'
import Calendar from '../src/calendar'
import data from '../dev/data'

// todo
// 1. test scope slots

describe('Calendar component', () => {
  test('component should match snapshot', () => {
    const wrapper = shallow(Calendar, {
      propsData: {
        startDate: new Date('2018-01-01'),
        dateData: data
      }
    })

    expect(wrapper.element).toMatchSnapshot()
  })

  test('mode is work', () => {
    const wrapper = shallow(Calendar, {
      propsData: {
        startDate: new Date('2018-01-01')
      }
    })

    const weekWrapper = shallow(Calendar, {
      propsData: {
        mode: 'week',
        startDate: new Date('2018-01-01')
      }
    })

    const monthRow = wrapper.findAll('.vue-calendar-body-row')
    const weekRow = weekWrapper.findAll('.vue-calendar-body-row')

    expect(monthRow.length).toBe(6)
    expect(weekRow.length).toBe(1)
  })

  test('has require props', () => {
    const { startDate, dateData, onMonthChange, mode, prefixCls } = Calendar.props
    expect(startDate).not.toBe(undefined)
    expect(dateData).not.toBe(undefined)
    expect(onMonthChange.type).toBe(Function)
    expect(mode).not.toBe(undefined)
    expect(prefixCls.default).toBe('vue-calendar')
  })

  test('has currect change action', () => {
    const prefixCls = 'kit-calendar'
    const wrapper = shallow(Calendar, {
      propsData: {
        startDate: '2018-01-01',
        prefixCls
      }
    })

    const prev = wrapper.find(`.${prefixCls}-prev`)
    const next = wrapper.find(`.${prefixCls}-next`)
    const title = wrapper.find(`.${prefixCls}-header-date`)

    next.trigger('click')
    wrapper.vm
      .$nextTick()
      .then(() => {
        expect(title.text()).toBe('2018-02')

        prev.trigger('click')
        return wrapper.vm.$nextTick()
      })
      .then(() => {
        expect(title.text()).toBe('2018-01')
      })
  })
})
