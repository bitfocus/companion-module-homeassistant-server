import { HassEntities } from 'home-assistant-js-websocket'
import InstanceSkel = require('../../../instance_skel')
import {
  CompanionFeedbackEvent,
  CompanionFeedbackResult,
  CompanionFeedbacks,
  CompanionInputFieldColor
} from '../../../instance_skel_types'
import { EntityPicker, OnOffPicker } from './choices'
import { DeviceConfig } from './config'
import { assertUnreachable } from './util'

export enum FeedbackId {
  SwitchState = 'switch_state',
  LightOnState = 'light_on_state'
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

export function GetFeedbacksList(instance: InstanceSkel<DeviceConfig>, state: HassEntities) {
  const feedbacks: CompanionFeedbacks = {}

  feedbacks[FeedbackId.SwitchState] = {
    label: 'Change colors from switch state',
    description: 'If the switch state matches the rule, change colors of the bank',
    options: [
      ForegroundPicker(instance.rgb(255, 255, 255)),
      BackgroundPicker(instance.rgb(0, 255, 0)),
      EntityPicker(state, 'switch'),
      OnOffPicker()
    ]
  }
  feedbacks[FeedbackId.LightOnState] = {
    label: 'Change colors from light on state',
    description: 'If the light state matches the rule, change colors of the bank',
    options: [
      ForegroundPicker(instance.rgb(255, 255, 255)),
      BackgroundPicker(instance.rgb(0, 255, 0)),
      EntityPicker(state, 'light'),
      OnOffPicker()
    ]
  }

  return feedbacks
}

export function ExecuteFeedback(
  instance: InstanceSkel<DeviceConfig>,
  state: HassEntities,
  feedback: CompanionFeedbackEvent
): CompanionFeedbackResult {
  const opt = feedback.options
  const getOptColors = () => ({ color: Number(opt.fg), bgcolor: Number(opt.bg) })

  const feedbackType = feedback.type as FeedbackId
  switch (feedbackType) {
    case FeedbackId.SwitchState:
    case FeedbackId.LightOnState: {
      const entity = state[String(opt.entity_id)]
      if (entity) {
        const isOn = entity.state === 'on'
        const targetOn = !!opt.state
        if (isOn === targetOn) {
          return getOptColors()
        }
      }
      break
    }
    default:
      assertUnreachable(feedbackType)
      instance.debug('Unknown action: ' + feedback.type)
  }

  return {}
}
