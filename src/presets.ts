import { HassEntities } from 'home-assistant-js-websocket'
import InstanceSkel = require('../../../instance_skel')
import { CompanionPreset } from '../../../instance_skel_types'
import { ActionId } from './actions'
import { EntityPicker } from './choices'
import { DeviceConfig } from './config'
import { FeedbackId } from './feedback'
import { OnOffToggle } from './util'

interface CompanionPresetExt extends CompanionPreset {
  feedbacks: Array<
    {
      type: FeedbackId
    } & CompanionPreset['feedbacks'][0]
  >
  actions: Array<
    {
      action: ActionId
    } & CompanionPreset['actions'][0]
  >
}

export function GetPresetsList(instance: InstanceSkel<DeviceConfig>, state: HassEntities): CompanionPreset[] {
  const presets: CompanionPresetExt[] = []

  const switchPicker = EntityPicker(state, 'switch')
  switchPicker.choices.forEach(ent => {
    presets.push({
      category: 'Switch',
      label: `Switch ${ent.label}`,
      bank: {
        style: 'text',
        text: ent.label,
        size: 'auto',
        color: instance.rgb(255, 255, 255),
        bgcolor: instance.rgb(0, 0, 0)
      },
      feedbacks: [
        {
          type: FeedbackId.SwitchState,
          options: {
            bg: instance.rgb(0, 255, 0),
            fg: instance.rgb(255, 255, 255),
            entity_id: ent.id,
            state: true
          }
        }
      ],
      actions: [
        {
          action: ActionId.SetSwitch,
          options: {
            entity_id: ent.id,
            state: OnOffToggle.Toggle
          }
        }
      ]
    })
  })
  const lightPicker = EntityPicker(state, 'light')
  lightPicker.choices.forEach(ent => {
    presets.push({
      category: 'Light',
      label: `Light ${ent.label}`,
      bank: {
        style: 'text',
        text: ent.label,
        size: 'auto',
        color: instance.rgb(255, 255, 255),
        bgcolor: instance.rgb(0, 0, 0)
      },
      feedbacks: [
        {
          type: FeedbackId.LightOnState,
          options: {
            bg: instance.rgb(0, 255, 0),
            fg: instance.rgb(255, 255, 255),
            entity_id: ent.id,
            state: true
          }
        }
      ],
      actions: [
        {
          action: ActionId.SetLightOn,
          options: {
            entity_id: ent.id,
            state: OnOffToggle.Toggle
          }
        }
      ]
    })
  })

  return presets
}
