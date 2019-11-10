import { HassEntities } from 'home-assistant-js-websocket'
import InstanceSkel = require('../../../instance_skel')
import { CompanionVariable } from '../../../instance_skel_types'
import { DeviceConfig } from './config'

export function updateVariables(_instance: InstanceSkel<DeviceConfig>, _state: HassEntities) {
  // function numToString(val: number | undefined) {
  //   if (val === undefined) {
  //     return '-'
  //   } else {
  //     return `${val}%`
  //   }
  // }
  // instance.setVariable('mic_volume', numToString(state.mic.volume))
  // instance.setVariable('speaker_volume', numToString(state.speaker.volume))
}

export function InitVariables(instance: InstanceSkel<DeviceConfig>, state: HassEntities) {
  const variables: CompanionVariable[] = []

  // variables.push({
  //   label: 'Mic Volume',
  //   name: 'mic_volume'
  // })
  // variables.push({
  //   label: 'Speaker Volume',
  //   name: 'speaker_volume'
  // })
  updateVariables(instance, state)

  instance.setVariableDefinitions(variables)
}
