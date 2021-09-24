import { HassEntities } from 'home-assistant-js-websocket'
import InstanceSkel = require('../../../instance_skel')
import { CompanionVariable } from '../../../instance_skel_types'
import { DeviceConfig } from './config'

export function updateVariables(instance: InstanceSkel<DeviceConfig>, state: HassEntities): void {
	const variables: { [variableId: string]: string | undefined } = {}
	for (const entity of Object.values(state)) {
		variables[`entity.${entity.entity_id}.value`] = entity.state;
		variables[`entity.${entity.entity_id}`] = entity.attributes.friendly_name ?? entity.entity_id;
	}

	instance.setVariables(variables)
}

export function InitVariables(instance: InstanceSkel<DeviceConfig>, state: HassEntities): void {
	const variables: CompanionVariable[] = []

	for (const entity of Object.values(state)) {
		variables.push({
			label: `Entity: ${(_a = entity.attributes.friendly_name) !== null && _a !== void 0 ? _a : entity.entity_id}`,
			name: `entity.${entity.entity_id}.value`,
		});
		variables.push({
			label: `Entity: ${entity.attributes.friendly_name ?? entity.entity_id}`,
			name: `entity.${entity.entity_id}`,
		});
	}
	instance.setVariableDefinitions(variables)
}
