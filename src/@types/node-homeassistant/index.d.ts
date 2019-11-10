declare module 'node-homeassistant' {
  export = HomeAssistantConnection
}

interface HomeAssistantOpts {
  host: string
  port: number
  protocol?: 'ws' | 'wss'
  retryTimeout?: number
  retryCount?: number
  password?: string
  token?: string
}

type ConnectionState = 'connected' | 'authenticated' | 'connection_error' | 'connection_closed' | 'reconnecting'

declare class HomeAssistantConnection {
  constructor(options: HomeAssistantOpts)

  connect(): Promise<any>
  reconnect(): true | void

  send(data: Object, addId: boolean): Promise<any> // TODO
  call(options: Object): Promise<any> // TODO

  subscribe(options: any): Promise<any> // TODO
  unsubscribe(options: any): Promise<any> // TODO

  findEntity(id: string): number // TODO
  updateState(change: any): boolean | void // TODO
  state(id: string): any // TODO

  // EventEmitter
  on(event: 'connection', listener: (state: ConnectionState) => void): any
  on(event: string, listener: (data: any) => void): any //TODO
}
