import { Connection, HassEntities } from 'home-assistant-js-websocket'
import InstanceSkel = require('../../../instance_skel')
import { CompanionActionEvent, CompanionActions } from '../../../instance_skel_types'
import { EntityPicker, OnOffTogglePicker } from './choices'
import { DeviceConfig } from './config'
import { assertUnreachable, OnOffToggle } from './util'

export enum ActionId {
  SetSwitch = 'set_switch',
  SetLightOn = 'set_light_on'
}

export function GetActionsList(state: HassEntities) {
  const actions: CompanionActions = {}

  actions[ActionId.SetSwitch] = {
    label: 'Set switch state',
    options: [EntityPicker(state, 'switch'), OnOffTogglePicker()]
  }
  actions[ActionId.SetLightOn] = {
    label: 'Set light on/off state',
    options: [EntityPicker(state, 'light'), OnOffTogglePicker()]
  }

  return actions
}

export function HandleAction(
  instance: InstanceSkel<DeviceConfig>,
  client: Connection,
  state: HassEntities,
  action: CompanionActionEvent
) {
  const opt = action.options
  // const getOptInt = (key: string) => {
  //   const val = parseInt(opt[key], 10)
  //   if (isNaN(val)) {
  //     throw new Error(`Invalid option '${key}'`)
  //   }
  //   return val
  // }
  // const getOptBool = (key: string) => {
  //   return !!opt[key]
  // }

  try {
    const actionId = action.action as ActionId
    switch (actionId) {
      case ActionId.SetSwitch:
      case ActionId.SetLightOn: {
        const entity = state[String(opt.entity_id)]
        if (entity) {
          let newState: string
          switch (opt.state as OnOffToggle) {
            case OnOffToggle.Off:
              newState = 'turn_off'
              break
            case OnOffToggle.Toggle:
              newState = entity.state === 'off' ? 'turn_on' : 'turn_off'
              break
            default:
              newState = 'turn_on'
              break
          }

          client.sendMessage({
            type: 'call_service',
            domain: 'homeassistant',
            service: newState,
            service_data: {
              entity_id: [opt.entity_id]
            }
          })
        }
        break
      }
      default:
        assertUnreachable(actionId)
        instance.debug('Unknown action: ' + action.action)
    }
  } catch (e) {
    instance.debug('Action failed: ' + e)
  }
}
