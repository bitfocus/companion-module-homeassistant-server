import {
	CompanionInputFieldCheckbox,
	CompanionInputFieldDropdown,
	CompanionInputFieldMultiDropdown,
	DropdownChoice,
} from '@companion-module/base'
import type { HassEntity } from 'home-assistant-js-websocket'
import { OnOffToggle } from './util.js'

export const LIGHT_MAX_BRIGHTNESS = 255

export function OnOffTogglePicker(): CompanionInputFieldDropdown {
	const options = [
		{ id: OnOffToggle.On, label: 'On' },
		{ id: OnOffToggle.Off, label: 'Off' },
		{ id: OnOffToggle.Toggle, label: 'Toggle' },
	]
	return {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: OnOffToggle.On,
		choices: options,
	}
}

export function OnOffPicker(): CompanionInputFieldCheckbox {
	return {
		type: 'checkbox',
		label: 'State',
		id: 'state',
		default: true,
	}
}

function EntityOptions(state: HassEntity[], prefix: string | undefined): DropdownChoice[] {
	const entities = state.filter((ent) => prefix === undefined || ent.entity_id.indexOf(`${prefix}.`) === 0)

	return entities
		.map((ent) => ({
			id: ent.entity_id,
			label: ent.attributes.friendly_name || ent.entity_id,
		}))
		.sort((a, b) => {
			const a2 = a.label.toLowerCase()
			const b2 = b.label.toLowerCase()
			return a2 === b2 ? 0 : a2 < b2 ? -1 : 1
		})
}

export function EntityPicker(state: HassEntity[], prefix: string | undefined): CompanionInputFieldDropdown {
	const choices = EntityOptions(state, prefix)

	return {
		type: 'dropdown',
		label: 'Entity',
		id: 'entity_id',
		default: choices[0]?.id ?? '',
		choices: choices,
	}
}

export function EntityMultiplePicker(
	state: HassEntity[],
	prefix: string | undefined
): CompanionInputFieldMultiDropdown {
	const choices = EntityOptions(state, prefix)

	return {
		type: 'multidropdown',
		label: 'Entities',
		id: 'entity_id',
		default: [],
		choices: choices,
	}
}
