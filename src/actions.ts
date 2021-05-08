import { Connection, HassEntities } from 'home-assistant-js-websocket'
import { CompanionActionEvent, CompanionActions, CompanionAction } from '../../../instance_skel_types'
import { EntityPicker, OnOffTogglePicker } from './choices'
import { OnOffToggle } from './util'

export enum ActionId {
	SetSwitch = 'set_switch',
	SetInputBoolean = 'set_input_boolean',
	SetLightOn = 'set_light_on',
	ExecuteScript = 'execute_script',
}

type CompanionActionWithCallback = CompanionAction & Required<Pick<CompanionAction, 'callback'>>

export function GetActionsList(
	getProps: () => { state: HassEntities; client: Connection | undefined }
): CompanionActions {
	const entityOnOff = (opt: CompanionActionEvent['options']): void => {
		const { state, client } = getProps()

		const entity = state[String(opt.entity_id)]
		if (entity) {
			let newState: string
			switch (opt.state as OnOffToggle) {
				case OnOffToggle.Off:
					newState = 'turn_off'
					break
				case OnOffToggle.Toggle:
					newState = entity.state === 'off' ? 'turn_on' : 'turn_off'
					break
				default:
					newState = 'turn_on'
					break
			}

			client?.sendMessage({
				type: 'call_service',
				domain: 'homeassistant',
				service: newState,
				service_data: {
					entity_id: [opt.entity_id],
				},
			})
		}
	}

	const { state: initialState } = getProps()
	const actions: { [id in ActionId]: CompanionActionWithCallback | undefined } = {
		[ActionId.SetSwitch]: {
			label: 'Set switch state',
			options: [EntityPicker(initialState, 'switch'), OnOffTogglePicker()],
			callback: (evt): void => entityOnOff(evt.options),
		},
		[ActionId.SetInputBoolean]: {
			label: 'Set input_boolean state',
			options: [EntityPicker(initialState, 'input_boolean'), OnOffTogglePicker()],
			callback: (evt): void => entityOnOff(evt.options),
		},
		[ActionId.SetLightOn]: {
			label: 'Set light on/off state',
			options: [EntityPicker(initialState, 'light'), OnOffTogglePicker()],
			callback: (evt): void => entityOnOff(evt.options),
		},
		[ActionId.ExecuteScript]: {
			label: 'Execute script',
			options: [EntityPicker(initialState, 'script')],
			callback: (evt): void => {
				const { client } = getProps()
				client?.sendMessage({
					type: 'call_service',
					domain: 'homeassistant',
					service: 'turn_on',
					service_data: {
						entity_id: [evt.options.entity_id],
					},
				})
			},
		},
	}

	return actions
}
