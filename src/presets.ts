import {
	combineRgb,
	type CompanionPresetDefinitions,
	type CompanionButtonPresetDefinition,
} from '@companion-module/base'
import type { HassEntity } from 'home-assistant-js-websocket'
import { ActionId } from './actions.js'
import { EntityPicker } from './choices.js'
import { FeedbackId } from './feedback.js'
import { OnOffToggle } from './util.js'

interface CompanionPresetExt extends CompanionButtonPresetDefinition {
	feedbacks: Array<
		{
			feedbackId: FeedbackId
		} & CompanionButtonPresetDefinition['feedbacks'][0]
	>
	steps: Array<{
		down: Array<
			{
				actionId: ActionId
			} & CompanionButtonPresetDefinition['steps'][0]['down'][0]
		>
		up: Array<
			{
				actionId: ActionId
			} & CompanionButtonPresetDefinition['steps'][0]['up'][0]
		>
	}>
}
interface CompanionPresetDefinitionsExt {
	[id: string]: CompanionPresetExt | undefined
}

export function GetPresetsList(state: HassEntity[]): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitionsExt = {}

	for (const ent of EntityPicker(state, 'switch').choices) {
		presets[`switch_set_${ent.id}`] = {
			type: 'button',
			category: 'Switch',
			name: `Switch ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.SwitchState,
					options: {
						entity_id: ent.id,
						state: true,
					},
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(0, 0, 0),
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: ActionId.SetSwitch,
							options: {
								entity_id: ent.id,
								state: OnOffToggle.Toggle,
							},
						},
					],
					up: [],
				},
			],
		}
	}

	for (const ent of EntityPicker(state, 'input_boolean').choices) {
		presets[`input_boolean_set_${ent.id}`] = {
			type: 'button',
			category: 'Input Boolean',
			name: `Input Boolean ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.InputBooleanState,
					options: {
						entity_id: ent.id,
						state: true,
					},
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(0, 0, 0),
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: ActionId.SetInputBoolean,
							options: {
								entity_id: ent.id,
								state: OnOffToggle.Toggle,
							},
						},
					],
					up: [],
				},
			],
		}
	}

	for (const ent of EntityPicker(state, 'light').choices) {
		presets[`light_set_${ent.id}`] = {
			type: 'button',
			category: 'Light',
			name: `Light ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.LightOnState,
					options: {
						entity_id: ent.id,
						state: true,
					},
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(0, 0, 0),
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: ActionId.SetLightOn,
							options: {
								entity_id: ent.id,
								state: OnOffToggle.Toggle,
							},
						},
					],
					up: [],
				},
			],
		}
	}

	for (const ent of EntityPicker(state, 'script').choices) {
		presets[`script_execute_${ent.id}`] = {
			type: 'button',
			category: 'Script',
			name: `Script ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: ActionId.ExecuteScript,
							options: {
								entity_id: ent.id,
							},
						},
					],
					up: [],
				},
			],
		}
	}

	for (const ent of EntityPicker(state, 'button').choices) {
		presets[`button_press_${ent.id}`] = {
			type: 'button',
			category: 'Button',
			name: `Button ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: ActionId.PressButton,
							options: {
								entity_id: ent.id,
							},
						},
					],
					up: [],
				},
			],
		}
	}

	for (const ent of EntityPicker(state, 'scene').choices) {
		presets[`scene_activate_${ent.id}`] = {
			type: 'button',
			category: 'Scene',
			name: `Scene ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [],
			steps: [
				{
					down: [
						{
							actionId: ActionId.ActivateScene,
							options: {
								entity_id: ent.id,
							},
						},
					],
					up: [],
				},
			],
		}
	}

	for (const ent of EntityPicker(state, 'group').choices) {
		presets[`group_set_on_${ent.id}`] = {
			type: 'button',
			category: 'Group',
			name: `Group ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [
				{
					feedbackId: FeedbackId.GroupOnState,
					options: {
						entity_id: ent.id,
						state: true,
					},
					style: {
						bgcolor: combineRgb(0, 255, 0),
						color: combineRgb(0, 0, 0),
					},
				},
			],
			steps: [
				{
					down: [
						{
							actionId: ActionId.SetGroupOn,
							options: {
								entity_id: ent.id,
								state: OnOffToggle.Toggle,
							},
						},
					],
					up: [],
				},
			],
		}
	}

	return presets
}
