import type { CompanionVariableDefinition, CompanionVariableValues, InstanceBase } from '@companion-module/base'
import type { HassEntity } from 'home-assistant-js-websocket'
import { LIGHT_MAX_BRIGHTNESS } from './choices.js'
import type { DeviceConfig } from './config.js'
import { HassEntitiesWithChanges } from './hass/entities.js'

export function updateVariables(instance: InstanceBase<DeviceConfig>, state: HassEntitiesWithChanges): void {
	const variables: CompanionVariableValues = {}

	const updateForIds = (ids: Set<string>): void => {
		for (const id of ids) {
			const entity = state.entities[id]
			if (!entity) continue
			updateEntityVariables(variables, entity)
		}
	}

	updateForIds(state.added)
	updateForIds(state.contentChanged)
	updateForIds(state.friendlyNameChange)

	instance.setVariableValues(variables as any) // TODO - remove this cast
}

function updateEntityVariables(variables: CompanionVariableValues, entity: HassEntity): void {
	variables[`entity.${entity.entity_id}.value`] = entity.state
	variables[`entity.${entity.entity_id}`] = entity.attributes.friendly_name ?? entity.entity_id

	if (entity.entity_id.startsWith('light.')) {
		variables[`entity.${entity.entity_id}.brightness`] = Math.round(
			(100 * (entity.attributes.brightness ?? 0)) / LIGHT_MAX_BRIGHTNESS,
		)
	}

	if (entity.attributes) {
		Object.keys(entity.attributes).forEach((attr) => {
			variables[`entity.${entity.entity_id}.attributes.${attr}`] = entity.attributes[attr]
		})
	}
}

export function InitVariables(instance: InstanceBase<DeviceConfig>, state: HassEntity[]): void {
	const variables: CompanionVariableDefinition[] = []

	for (const entity of state) {
		const name = entity.attributes.friendly_name ?? entity.entity_id
		variables.push({ name: `Entity Value: ${name}`, variableId: `entity.${entity.entity_id}.value` })
		variables.push({ name: `Entity Name: ${name}`, variableId: `entity.${entity.entity_id}` })

		// for (let i = 0; i < 1000; i++) {
		// 	variables.push({
		// 		name: `Entity Value: ${name}_${i}`,
		// 		variableId: `entity.${entity.entity_id}.value_${i}`,
		// 	})
		// }

		if (entity.entity_id.startsWith('light.')) {
			variables.push({ name: `Light Brightness: ${name}`, variableId: `entity.${entity.entity_id}.brightness` })
		}

		if (entity.attributes) {
			Object.keys(entity.attributes).forEach((attr) => {
				variables.push({
					name: `Entity Attribute: ${name} - ${attr}`,
					variableId: `entity.${entity.entity_id}.attributes.${attr}`,
				})
			})
		}
	}

	instance.setVariableDefinitions(variables)
}
