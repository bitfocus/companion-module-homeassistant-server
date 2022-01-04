import { HassEntities } from 'home-assistant-js-websocket'
import InstanceSkel = require('../../../instance_skel')
import { CompanionVariable } from '../../../instance_skel_types'
import { LIGHT_MAX_BRIGHTNESS } from './choices'
import { DeviceConfig } from './config'

export function updateVariables(instance: InstanceSkel<DeviceConfig>, state: HassEntities): void {
	const variables: { [variableId: string]: string | number | undefined } = {}
	for (const entity of Object.values(state)) {
		variables[`entity.${entity.entity_id}.value`] = entity.state
		variables[`entity.${entity.entity_id}`] = entity.attributes.friendly_name ?? entity.entity_id

		if (entity.entity_id.startsWith('light.')) {
			variables[`entity.${entity.entity_id}.brightness`] = Math.round(
				(100 * (entity.attributes.brightness ?? 0)) / LIGHT_MAX_BRIGHTNESS
			)
		}
	}

	instance.setVariables(variables as any) // TODO - remove this cast
}

export function InitVariables(instance: InstanceSkel<DeviceConfig>, state: HassEntities): void {
	const variables: CompanionVariable[] = []

	for (const entity of Object.values(state)) {
		variables.push({
			label: `Entity Value: ${entity.attributes.friendly_name ?? entity.entity_id}`,
			name: `entity.${entity.entity_id}.value`,
		})
		variables.push({
			label: `Entity Name: ${entity.attributes.friendly_name ?? entity.entity_id}`,
			name: `entity.${entity.entity_id}`,
		})

		if (entity.entity_id.startsWith('light.')) {
			variables.push({
				label: `Light Brightness: ${entity.attributes.friendly_name ?? entity.entity_id}`,
				name: `entity.${entity.entity_id}.brightness`,
			})
		}
	}
	instance.setVariableDefinitions(variables)
}
