import { CompanionVariableDefinition, CompanionVariableValues, InstanceBase } from '@companion-module/base'
import { HassEntities } from 'home-assistant-js-websocket'
import { LIGHT_MAX_BRIGHTNESS } from './choices'
import { DeviceConfig } from './config'

export function updateVariables(instance: InstanceBase<DeviceConfig>, state: HassEntities): void {
	const variables: CompanionVariableValues = {}
	for (const entity of Object.values(state)) {
		variables[`entity.${entity.entity_id}.value`] = entity.state
		variables[`entity.${entity.entity_id}`] = entity.attributes.friendly_name ?? entity.entity_id

		if (entity.entity_id.startsWith('light.')) {
			variables[`entity.${entity.entity_id}.brightness`] = Math.round(
				(100 * (entity.attributes.brightness ?? 0)) / LIGHT_MAX_BRIGHTNESS
			)
		}
	}

	instance.setVariableValues(variables as any) // TODO - remove this cast
}

export function InitVariables(instance: InstanceBase<DeviceConfig>, state: HassEntities): void {
	const variables: CompanionVariableDefinition[] = []

	for (const entity of Object.values(state)) {
		variables.push({
			name: `Entity Value: ${entity.attributes.friendly_name ?? entity.entity_id}`,
			variableId: `entity.${entity.entity_id}.value`,
		})
		variables.push({
			name: `Entity Name: ${entity.attributes.friendly_name ?? entity.entity_id}`,
			variableId: `entity.${entity.entity_id}`,
		})

		if (entity.entity_id.startsWith('light.')) {
			variables.push({
				name: `Light Brightness: ${entity.attributes.friendly_name ?? entity.entity_id}`,
				variableId: `entity.${entity.entity_id}.brightness`,
			})
		}
	}

	instance.setVariableDefinitions(variables)
}
