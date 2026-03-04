import type { CompanionVariableDefinitions, InstanceBase, JsonValue } from '@companion-module/base'
import type { HassEntity } from 'home-assistant-js-websocket'
import { LIGHT_MAX_BRIGHTNESS } from './choices.js'
import { HassEntitiesWithChanges } from './hass/entities.js'
import type { HassSchema } from './schema.js'

export type HassVariables = {
	[key: `entity.${string}`]: JsonValue | undefined // Because of clash with the below :(
	[key: `entity.${string}.value`]: JsonValue | undefined
	[key: `entity.${string}.brightness`]: number
	[key: `entity.${string}.attributes.${string}`]: JsonValue | undefined
}

export function updateVariables(instance: InstanceBase<HassSchema>, state: HassEntitiesWithChanges): void {
	const variables: Partial<HassVariables> = {}

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

function updateEntityVariables(variables: Partial<HassVariables>, entity: HassEntity): void {
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

export function InitVariables(instance: InstanceBase<HassSchema>, state: HassEntity[]): void {
	const variables: CompanionVariableDefinitions<HassVariables> = {}

	for (const entity of state) {
		const name = entity.attributes.friendly_name ?? entity.entity_id
		variables[`entity.${entity.entity_id}.value`] = { name: `Entity Value: ${name}` }
		variables[`entity.${entity.entity_id}`] = { name: `Entity Name: ${name}` }

		// for (let i = 0; i < 1000; i++) {
		// 	variables.push({
		// 		name: `Entity Value: ${name}_${i}`,
		// 		variableId: `entity.${entity.entity_id}.value_${i}`,
		// 	})
		// }

		if (entity.entity_id.startsWith('light.')) {
			variables[`entity.${entity.entity_id}.brightness`] = { name: `Light Brightness: ${name}` }
		}

		if (entity.attributes) {
			Object.keys(entity.attributes).forEach((attr) => {
				variables[`entity.${entity.entity_id}.attributes.${attr}`] = {
					name: `Entity Attribute: ${name} - ${attr}`,
				}
			})
		}
	}

	instance.setVariableDefinitions(variables)
}
