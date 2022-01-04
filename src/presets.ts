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

	const switchPicker = EntityPicker(state, 'switch')
	switchPicker.choices.forEach((ent) => {
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
	})

	const inputBooleanPicker = EntityPicker(state, 'input_boolean')
	inputBooleanPicker.choices.forEach((ent) => {
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
	})

	const lightPicker = EntityPicker(state, 'light')
	lightPicker.choices.forEach((ent) => {
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
	})

	const scriptPicker = EntityPicker(state, 'script')
	scriptPicker.choices.forEach((ent) => {
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
	})

	const buttonPicker = EntityPicker(state, 'button')
	buttonPicker.choices.forEach((ent) => {
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
	})

	return presets
}
