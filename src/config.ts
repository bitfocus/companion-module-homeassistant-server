import { SomeCompanionConfigField } from '@companion-module/base'

export type DeviceConfig = {
	url?: string
	ignore_certificates?: boolean
}

export type DeviceSecrets = {
	access_token?: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'url',
			label: 'Home Assistant Url',
			width: 6,
		},
		{
			type: 'checkbox',
			id: 'ignore_certificates',
			label: 'Ignore Certificate Signing',
			width: 6,
			default: false,
		},
		{
			type: 'secret-text',
			id: 'access_token',
			label: 'Access Token',
			width: 6,
		},
	]
}
