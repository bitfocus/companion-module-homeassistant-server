import { HassEntities } from 'home-assistant-js-websocket'
import {
  CompanionInputFieldCheckbox,
  CompanionInputFieldDropdown,
  CompanionInputFieldNumber
} from '../../../instance_skel_types'
import { OnOffToggle } from './util'

export function VolumePicker(): CompanionInputFieldNumber {
  return {
    type: 'number',
    label: 'Volume',
    id: 'volume',
    default: 50,
    max: 100,
    min: 0
  }
}
export function MutedPicker(): CompanionInputFieldCheckbox {
  return {
    type: 'checkbox',
    label: 'Muted',
    id: 'muted',
    default: false
  }
}

export function OnOffTogglePicker(): CompanionInputFieldDropdown {
  const options = [
    { id: OnOffToggle.On, label: 'On' },
    { id: OnOffToggle.Off, label: 'Off' },
    { id: OnOffToggle.Toggle, label: 'Toggle' }
  ]
  return {
    type: 'dropdown',
    label: 'State',
    id: 'state',
    default: OnOffToggle.On,
    choices: options
  }
}

export function OnOffPicker(): CompanionInputFieldCheckbox {
  return {
    type: 'checkbox',
    label: 'State',
    id: 'state',
    default: true
  }
}

export function SwitchEntityPicker(state: HassEntities): CompanionInputFieldDropdown {
  const entities = Object.values(state).filter(ent => ent.entity_id.indexOf('switch.') === 0)
  return {
    type: 'dropdown',
    label: 'Entity',
    id: 'entity_id',
    default: entities[0] ? entities[0].entity_id : '',
    choices: entities.map(ent => ({
      id: ent.entity_id,
      label: ent.attributes.friendly_name || ent.entity_id
    }))
  }
}
