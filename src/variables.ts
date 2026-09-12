import type { CompanionVariableDefinitions, InstanceBase, JsonValue } from '@companion-module/base'
import type { HassEntity } from 'home-assistant-js-websocket'
import { LIGHT_MAX_BRIGHTNESS } from './choices.js'
import { HassEntitiesWithChanges } from './hass/entities.js'
import type { HassSchema } from './schema.js'
import type { AttributeFilter, EntityFilter } from './filter.js'

export type HassVariables = {
	[key: `entity.${string}`]: JsonValue | undefined // Because of clash with the below :(
	[key: `entity.${string}.value`]: JsonValue | undefined
	[key: `entity.${string}.brightness`]: number
	[key: `entity.${string}.attributes.${string}`]: JsonValue | undefined
}

/**
 * Result of `InitVariables`: each included entity mapped to the attribute names
 * to expose. The filters are resolved once here, so the value-update path never
 * runs a glob/regex — it only reads this map.
 */
export type IncludedEntities = Map<string, string[]>

export function updateVariables(
	instance: InstanceBase<HassSchema>,
	state: HassEntitiesWithChanges,
	includedEntities: IncludedEntities,
): void {
	const variables: Partial<HassVariables> = {}

	const updateForIds = (ids: Set<string>): void => {
		for (const id of ids) {
			// Hot path: membership and attribute list are precomputed, no filtering here
			const attributeNames = includedEntities.get(id)
			if (!attributeNames) continue
			const entity = state.entities[id]
			if (!entity) continue
			updateEntityVariables(variables, entity, attributeNames)
		}
	}

	updateForIds(state.added)
	updateForIds(state.contentChanged)
	updateForIds(state.friendlyNameChange)

	instance.setVariableValues(variables as any) // TODO - remove this cast
}

function updateEntityVariables(variables: Partial<HassVariables>, entity: HassEntity, attributeNames: string[]): void {
	variables[`entity.${entity.entity_id}.value`] = entity.state
	variables[`entity.${entity.entity_id}`] = entity.attributes.friendly_name ?? entity.entity_id

	if (entity.entity_id.startsWith('light.')) {
		variables[`entity.${entity.entity_id}.brightness`] = Math.round(
			(100 * (entity.attributes.brightness ?? 0)) / LIGHT_MAX_BRIGHTNESS,
		)
	}

	for (const attr of attributeNames) {
		variables[`entity.${entity.entity_id}.attributes.${attr}`] = entity.attributes?.[attr]
	}
}

/**
 * (Re)build the variable definitions for all entities that pass the filter and
 * return the precomputed `IncludedEntities` for the value-update path.
 */
export function InitVariables(
	instance: InstanceBase<HassSchema>,
	state: HassEntity[],
	filter: EntityFilter,
	attributeFilter: AttributeFilter,
): IncludedEntities {
	const variables: CompanionVariableDefinitions<HassVariables> = {}
	const includedEntities: IncludedEntities = new Map()

	for (const entity of state) {
		if (!filter(entity.entity_id)) continue

		const name = entity.attributes.friendly_name ?? entity.entity_id
		variables[`entity.${entity.entity_id}.value`] = { name: `Entity Value: ${name}` }
		variables[`entity.${entity.entity_id}`] = { name: `Entity Name: ${name}` }

		if (entity.entity_id.startsWith('light.')) {
			variables[`entity.${entity.entity_id}.brightness`] = { name: `Light Brightness: ${name}` }
		}

		const attributeNames: string[] = []
		if (entity.attributes) {
			for (const attr of Object.keys(entity.attributes)) {
				if (!attributeFilter(attr)) continue
				attributeNames.push(attr)
				variables[`entity.${entity.entity_id}.attributes.${attr}`] = {
					name: `Entity Attribute: ${name} - ${attr}`,
				}
			}
		}

		includedEntities.set(entity.entity_id, attributeNames)
	}

	instance.setVariableDefinitions(variables)
	return includedEntities
}
