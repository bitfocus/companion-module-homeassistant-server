import type { CompanionPresetSection, CompanionPresetDefinitions } from '@companion-module/base'
import type { HassEntity } from 'home-assistant-js-websocket'
import { EntityPicker } from './choices.js'
import { OnOffToggle } from './util.js'
import type { HassSchema } from './schema.js'

export function GetPresetsList(
	state: HassEntity[],
): [CompanionPresetSection[], CompanionPresetDefinitions<HassSchema>] {
	const sections: CompanionPresetSection[] = []
	const presets: CompanionPresetDefinitions<HassSchema> = {}

	const switchChoices = EntityPicker(state, 'switch').choices
	if (switchChoices.length > 0) {
		presets[`switch_toggle`] = {
			type: 'simple',
			name: `Switch X`,
			style: {
				text: `$(homeassistant-server:entity.$(local:entity-id))`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [
				{
					feedbackId: 'switch_state',
					options: {
						entity_id: { isExpression: true, value: '$(local:entity-id)' },
						state: true,
					},
					style: {
						bgcolor: 0x00ff00,
						color: 0x000000,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'set_switch',
							options: {
								entity_id: { isExpression: true, value: '[$(local:entity-id)]' },
								state: OnOffToggle.Toggle,
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'entity-id',
					startupValue: '',
				},
			],
		}
		sections.push({
			id: 'switch',
			name: 'Switch',
			definitions: [
				{
					id: 'switch_toggle',
					name: '',
					type: 'template',
					presetId: 'switch_toggle',
					templateVariableName: 'entity-id',
					templateValues: switchChoices.map((ent) => ({
						label: `Switch ${ent.label}`,
						value: ent.id,
					})),
				},
			],
		})
	}

	const inputBooleanChoices = EntityPicker(state, 'input_boolean').choices
	if (inputBooleanChoices.length > 0) {
		presets[`input_boolean_set`] = {
			type: 'simple',
			name: `Input Boolean X`,
			style: {
				text: `$(homeassistant-server:entity.$(local:entity-id))`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [
				{
					feedbackId: 'input_boolean_state',
					options: {
						entity_id: { isExpression: true, value: '$(local:entity-id)' },
						state: true,
					},
					style: {
						bgcolor: 0x00ff00,
						color: 0x000000,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'set_input_boolean',
							options: {
								entity_id: { isExpression: true, value: '[$(local:entity-id)]' },
								state: OnOffToggle.Toggle,
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'entity-id',
					startupValue: '',
				},
			],
		}

		sections.push({
			id: 'input_boolean',
			name: 'Input Boolean',
			definitions: [
				{
					id: 'input_boolean_set',
					name: '',
					type: 'template',
					presetId: 'input_boolean_set',
					templateVariableName: 'entity-id',
					templateValues: inputBooleanChoices.map((ent) => ({
						label: `Input Boolean ${ent.label}`,
						value: ent.id,
					})),
				},
			],
		})
	}

	const lightChoices = EntityPicker(state, 'light').choices
	if (lightChoices.length > 0) {
		presets[`light_set`] = {
			type: 'simple',
			name: `Light X`,
			style: {
				text: `$(homeassistant-server:entity.$(local:entity-id))`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [
				{
					feedbackId: 'light_on_state',
					options: {
						entity_id: { isExpression: true, value: '$(local:entity-id)' },
						state: true,
					},
					style: {
						bgcolor: 0x00ff00,
						color: 0x000000,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'set_light_on',
							options: {
								entity_id: { isExpression: true, value: '[$(local:entity-id)]' },
								state: OnOffToggle.Toggle,
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'entity-id',
					startupValue: '',
				},
			],
		}

		sections.push({
			id: 'light',
			name: 'Light',
			definitions: [
				{
					id: 'light_set',
					name: '',
					type: 'template',
					presetId: 'light_set',
					templateVariableName: 'entity-id',
					templateValues: lightChoices.map((ent) => ({
						label: `Light ${ent.label}`,
						value: ent.id,
					})),
				},
			],
		})
	}

	const scriptChoices = EntityPicker(state, 'script').choices
	if (scriptChoices.length > 0) {
		presets[`script_execute`] = {
			type: 'simple',
			name: `Script X`,
			style: {
				text: `$(homeassistant-server:entity.$(local:entity-id))`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: 'execute_script',
							options: {
								entity_id: { isExpression: true, value: '[$(local:entity-id)]' },
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'entity-id',
					startupValue: '',
				},
			],
		}

		sections.push({
			id: 'script',
			name: 'Script',
			definitions: [
				{
					id: 'script_execute',
					name: '',
					type: 'template',
					presetId: 'script_execute',
					templateVariableName: 'entity-id',
					templateValues: scriptChoices.map((ent) => ({
						label: `Script ${ent.label}`,
						value: ent.id,
					})),
				},
			],
		})
	}

	const buttonChoices = EntityPicker(state, 'button').choices
	if (buttonChoices.length > 0) {
		presets[`button_press`] = {
			type: 'simple',
			name: `Button X`,
			style: {
				text: `$(homeassistant-server:entity.$(local:entity-id))`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: 'press_button',
							options: {
								entity_id: { isExpression: true, value: '[$(local:entity-id)]' },
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'entity-id',
					startupValue: '',
				},
			],
		}

		sections.push({
			id: 'button',
			name: 'Button',
			definitions: [
				{
					id: 'button_press',
					name: '',
					type: 'template',
					presetId: 'button_press',
					templateVariableName: 'entity-id',
					templateValues: buttonChoices.map((ent) => ({
						label: `Button ${ent.label}`,
						value: ent.id,
					})),
				},
			],
		})
	}

	const sceneChoices = EntityPicker(state, 'scene').choices
	if (sceneChoices.length > 0) {
		presets[`scene_activate`] = {
			type: 'simple',
			name: `Scene X`,
			style: {
				text: `$(homeassistant-server:entity.$(local:entity-id))`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: 'activate_scene',
							options: {
								entity_id: { isExpression: true, value: '[$(local:entity-id)]' },
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'entity-id',
					startupValue: '',
				},
			],
		}

		sections.push({
			id: 'scene',
			name: 'Scene',
			definitions: [
				{
					id: 'scene_activate',
					name: '',
					type: 'template',
					presetId: 'scene_activate',
					templateVariableName: 'entity-id',
					templateValues: sceneChoices.map((ent) => ({
						label: `Scene ${ent.label}`,
						value: ent.id,
					})),
				},
			],
		})
	}

	const groupChoices = EntityPicker(state, 'group').choices
	if (groupChoices.length > 0) {
		presets[`group_set_on`] = {
			type: 'simple',
			name: `Group X`,
			style: {
				text: `$(homeassistant-server:entity.$(local:entity-id))`,
				size: 'auto',
				color: 0xffffff,
				bgcolor: 0x000000,
			},
			feedbacks: [
				{
					feedbackId: 'group_on_state',
					options: {
						entity_id: { isExpression: true, value: '$(local:entity-id)' },
						state: true,
					},
					style: {
						bgcolor: 0x00ff00,
						color: 0x000000,
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: 'set_group_on',
							options: {
								entity_id: { isExpression: true, value: '[$(local:entity-id)]' },
								state: OnOffToggle.Toggle,
							},
						},
					],
					up: [],
				},
			],
			localVariables: [
				{
					variableType: 'simple',
					variableName: 'entity-id',
					startupValue: '',
				},
			],
		}

		sections.push({
			id: 'group',
			name: 'Group',
			definitions: [
				{
					id: 'group_set_on',
					name: '',
					type: 'template',
					presetId: 'group_set_on',
					templateVariableName: 'entity-id',
					templateValues: groupChoices.map((ent) => ({
						label: `Group ${ent.label}`,
						value: ent.id,
					})),
				},
			],
		})
	}

	return [sections, presets]
}
