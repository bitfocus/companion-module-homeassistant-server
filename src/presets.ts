import { HassEntities } from 'home-assistant-js-websocket'
import { SetRequired } from 'type-fest'
import InstanceSkel = require('../../../instance_skel')
import { CompanionPreset } from '../../../instance_skel_types'
import { ActionId } from './actions'
import { EntityPicker } from './choices'
import { DeviceConfig } from './config'
import { FeedbackId } from './feedback'
import { OnOffToggle } from './util'

interface CompanionPresetExt extends CompanionPreset {
	feedbacks: Array<
		{
			type: FeedbackId
		} & SetRequired<CompanionPreset['feedbacks'][0], 'style'>
	>
	actions: Array<
		{
			action: ActionId
		} & CompanionPreset['actions'][0]
	>
}

export function GetPresetsList(instance: InstanceSkel<DeviceConfig>, state: HassEntities): CompanionPreset[] {
	const presets: CompanionPresetExt[] = []

	for (const ent of EntityPicker(state, 'switch').choices) {
		presets.push({
			category: 'Switch',
			label: `Switch ${ent.label}`,
			bank: {
				style: 'text',
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: instance.rgb(255, 255, 255),
				bgcolor: instance.rgb(0, 0, 0),
			},
			feedbacks: [
				{
					type: FeedbackId.SwitchState,
					options: {
						entity_id: ent.id,
						state: true,
					},
					style: {
						bgcolor: instance.rgb(0, 255, 0),
						color: instance.rgb(0, 0, 0),
					},
				},
			],
			actions: [
				{
					action: ActionId.SetSwitch,
					options: {
						entity_id: ent.id,
						state: OnOffToggle.Toggle,
					},
				},
			],
		})
	}

	for (const ent of EntityPicker(state, 'input_boolean').choices) {
		presets.push({
			category: 'Input Boolean',
			label: `Input Boolean ${ent.label}`,
			bank: {
				style: 'text',
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: instance.rgb(255, 255, 255),
				bgcolor: instance.rgb(0, 0, 0),
			},
			feedbacks: [
				{
					type: FeedbackId.InputBooleanState,
					options: {
						entity_id: ent.id,
						state: true,
					},
					style: {
						bgcolor: instance.rgb(0, 255, 0),
						color: instance.rgb(0, 0, 0),
					},
				},
			],
			actions: [
				{
					action: ActionId.SetInputBoolean,
					options: {
						entity_id: ent.id,
						state: OnOffToggle.Toggle,
					},
				},
			],
		})
	}

	for (const ent of EntityPicker(state, 'light').choices) {
		presets.push({
			category: 'Light',
			label: `Light ${ent.label}`,
			bank: {
				style: 'text',
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: instance.rgb(255, 255, 255),
				bgcolor: instance.rgb(0, 0, 0),
			},
			feedbacks: [
				{
					type: FeedbackId.LightOnState,
					options: {
						entity_id: ent.id,
						state: true,
					},
					style: {
						bgcolor: instance.rgb(0, 255, 0),
						color: instance.rgb(0, 0, 0),
					},
				},
			],
			actions: [
				{
					action: ActionId.SetLightOn,
					options: {
						entity_id: ent.id,
						state: OnOffToggle.Toggle,
					},
				},
			],
		})
	}

	for (const ent of EntityPicker(state, 'script').choices) {
		presets.push({
			category: 'Script',
			label: `Script ${ent.label}`,
			bank: {
				style: 'text',
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: instance.rgb(255, 255, 255),
				bgcolor: instance.rgb(0, 0, 0),
			},
			feedbacks: [],
			actions: [
				{
					action: ActionId.ExecuteScript,
					options: {
						entity_id: ent.id,
					},
				},
			],
		})
	}

	for (const ent of EntityPicker(state, 'button').choices) {
		presets.push({
			category: 'Button',
			label: `Button ${ent.label}`,
			bank: {
				style: 'text',
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: instance.rgb(255, 255, 255),
				bgcolor: instance.rgb(0, 0, 0),
			},
			feedbacks: [],
			actions: [
				{
					action: ActionId.PressButton,
					options: {
						entity_id: ent.id,
					},
				},
			],
		})
	}

	for (const ent of EntityPicker(state, 'scene').choices) {
		presets.push({
			category: 'Scene',
			label: `Scene ${ent.label}`,
			bank: {
				style: 'text',
				text: `$(homeassistant-server:entity.${ent.id})`,
				size: 'auto',
				color: instance.rgb(255, 255, 255),
				bgcolor: instance.rgb(0, 0, 0),
			},
			feedbacks: [],
			actions: [
				{
					action: ActionId.ActivateScene,
					options: {
						entity_id: ent.id,
					},
				},
			],
		})
	}

	return presets
}
