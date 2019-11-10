import { SomeCompanionConfigField } from '../../../instance_skel_types'

export interface DeviceConfig {
  url?: string
  access_token?: string
}

export function GetConfigFields(): SomeCompanionConfigField[] {
  return [
    {
      type: 'textinput',
      id: 'url',
      label: 'Home Assistant Url',
      width: 6
    },
    {
      type: 'textinput',
      id: 'access_token',
      label: 'Access Token',
      width: 6
    }
  ]
}
