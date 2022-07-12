import { combineRgb, CompanionPresetDefinitions, CompanionPressButtonPresetDefinition } from '@companion-module/base'
import { HassEntities } from 'home-assistant-js-websocket'
import { ActionId } from './actions'
import { EntityPicker } from './choices'
import { FeedbackId } from './feedback'
import { OnOffToggle } from './util'

interface CompanionPresetExt extends CompanionPressButtonPresetDefinition {
	feedbacks: Array<
		{
			feedbackId: FeedbackId
		} & CompanionPressButtonPresetDefinition['feedbacks'][0]
	>
	actions: {
		down: Array<
			{
				actionId: ActionId
			} & CompanionPressButtonPresetDefinition['actions']['down'][0]
		>
		up: Array<
			{
				actionId: ActionId
			} & CompanionPressButtonPresetDefinition['actions']['up'][0]
		>
	}
}
interface CompanionPresetDefinitionsExt {
	[id: string]: CompanionPresetExt | undefined
}

export function GetPresetsList(state: HassEntities): CompanionPresetDefinitions {
	const presets: CompanionPresetDefinitionsExt = {}

	for (const ent of EntityPicker(state, 'switch').choices) {
		presets[`switch_set_${ent.id}`] = {
			type: 'press',
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
			actions: {
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
		}
	}

	for (const ent of EntityPicker(state, 'input_boolean').choices) {
		presets[`input_boolean_set_${ent.id}`] = {
			type: 'press',
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
			actions: {
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
		}
	}

	for (const ent of EntityPicker(state, 'light').choices) {
		presets[`light_set_${ent.id}`] = {
			type: 'press',
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
			actions: {
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
		}
	}

	for (const ent of EntityPicker(state, 'script').choices) {
		presets[`script_execute_${ent.id}`] = {
			type: 'press',
			category: 'Script',
			name: `Script ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [],
			actions: {
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
		}
	}

	for (const ent of EntityPicker(state, 'button').choices) {
		presets[`button_press_${ent.id}`] = {
			type: 'press',
			category: 'Button',
			name: `Button ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [],
			actions: {
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
		}
	}

	for (const ent of EntityPicker(state, 'scene').choices) {
		presets[`scene_activate_${ent.id}`] = {
			type: 'press',
			category: 'Scene',
			name: `Scene ${ent.label}`,
			style: {
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			feedbacks: [],
			actions: {
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
		}
	}

	for (const ent of EntityPicker(state, 'group').choices) {
		presets[`group_set_on_${ent.id}`] = {
			type: 'press',
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
			actions: {
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
		}
	}

	return presets
}
