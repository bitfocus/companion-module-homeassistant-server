import { HassEntities } from 'home-assistant-js-websocket'
import InstanceSkel = require('../../../instance_skel')
import {
  CompanionFeedbackEvent,
  CompanionFeedbacks,
  CompanionInputFieldColor,
  CompanionFeedback,
  CompanionFeedbackResult
} from '../../../instance_skel_types'
import { EntityPicker, OnOffPicker } from './choices'
import { DeviceConfig } from './config'

export enum FeedbackId {
  SwitchState = 'switch_state',
  InputBooleanState = 'input_boolean_state',
  LightOnState = 'light_on_state',
  BinarySensorState = 'binary_sensor_state'
}

export function ForegroundPicker(color: number): CompanionInputFieldColor {
  return {
    type: 'colorpicker',
    label: 'Foreground color',
    id: 'fg',
    default: color
  }
}
export function BackgroundPicker(color: number): CompanionInputFieldColor {
  return {
    type: 'colorpicker',
    label: 'Background color',
    id: 'bg',
    default: color
  }
}

type CompanionFeedbackWithCallback = CompanionFeedback & Required<Pick<CompanionFeedback, 'callback'>>

export function GetFeedbacksList(
  instance: InstanceSkel<DeviceConfig>,
  getState: () => HassEntities
): CompanionFeedbacks {
  const getOptColors = (opt: CompanionFeedbackEvent['options']): CompanionFeedbackResult => ({
    color: Number(opt.fg),
    bgcolor: Number(opt.bg)
  })

  const checkEntityOnOffState = (feedback: CompanionFeedbackEvent): CompanionFeedbackResult => {
    const state = getState()
    const entity = state[String(feedback.options.entity_id)]
    if (entity) {
      const isOn = entity.state === 'on'
      const targetOn = !!feedback.options.state
      if (isOn === targetOn) {
        return getOptColors(feedback.options)
      }
    }
    return {}
  }

  const initialState = getState()
  const feedbacks: { [id in FeedbackId]: CompanionFeedbackWithCallback | undefined } = {
    [FeedbackId.SwitchState]: {
      label: 'Change colors from switch state',
      description: 'If the switch state matches the rule, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(0, 255, 0)),
        EntityPicker(initialState, 'switch'),
        OnOffPicker()
      ],
      callback: (feedback): CompanionFeedbackResult => checkEntityOnOffState(feedback)
    },
    [FeedbackId.InputBooleanState]: {
      label: 'Change colors from input_boolean state',
      description: 'If the input_boolean state matches the rule, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(0, 255, 0)),
        EntityPicker(initialState, 'input_boolean'),
        OnOffPicker()
      ],
      callback: (feedback): CompanionFeedbackResult => checkEntityOnOffState(feedback)
    },
    [FeedbackId.LightOnState]: {
      label: 'Change colors from light on state',
      description: 'If the light state matches the rule, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(0, 255, 0)),
        EntityPicker(initialState, 'light'),
        OnOffPicker()
      ],
      callback: (feedback): CompanionFeedbackResult => checkEntityOnOffState(feedback)
    },
    [FeedbackId.BinarySensorState]: {
      label: 'Change colors from binary sensor state',
      description: 'If the binary sensor state matches the rule, change colors of the bank',
      options: [
        ForegroundPicker(instance.rgb(255, 255, 255)),
        BackgroundPicker(instance.rgb(0, 255, 0)),
        EntityPicker(initialState, 'binary_sensor'),
        OnOffPicker()
      ],
      callback: (feedback): CompanionFeedbackResult => checkEntityOnOffState(feedback)
    }
  }

  return feedbacks
}
