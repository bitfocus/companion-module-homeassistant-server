import {
  Auth,
  Connection,
  createConnection,
  HassEntities,
  subscribeEntities,
  UnsubscribeFunc
} from 'home-assistant-js-websocket'
import { isNumber } from 'util'
import InstanceSkel = require('../../../instance_skel')
import {
  CompanionActionEvent,
  CompanionConfigField,
  CompanionFeedbackEvent,
  CompanionFeedbackResult,
  CompanionSystem
} from '../../../instance_skel_types'
import { GetActionsList, HandleAction } from './actions'
import { DeviceConfig, GetConfigFields } from './config'
import { ExecuteFeedback, FeedbackId, GetFeedbacksList } from './feedback'
import { createSocket, hassErrorToString } from './hass-socket'
import { GetPresetsList } from './presets'
import { InitVariables, updateVariables } from './variables'

const RECONNECT_INTERVAL = 5000

class ControllerInstance extends InstanceSkel<DeviceConfig> {
  public needsReconnect: boolean

  private state: HassEntities
  private client: Connection | undefined
  private connecting: boolean
  private unsubscribeEntities: UnsubscribeFunc | undefined
  private initDone: boolean

  constructor(system: CompanionSystem, id: string, config: DeviceConfig) {
    super(system, id, config)

    this.connecting = false
    this.state = {}
    this.initDone = false
    this.needsReconnect = false
  }

  // Override base types to make types stricter
  public checkFeedbacks(feedbackId?: FeedbackId, ignoreInitDone?: boolean) {
    if (ignoreInitDone || this.initDone) {
      super.checkFeedbacks(feedbackId)
    }
  }

  /**
   * Main initialization function called once the module
   * is OK to start doing things.
   */
  public init() {
    this.status(this.STATUS_UNKNOWN)
    this.updateConfig(this.config)

    InitVariables(this, this.state)
    this.setPresetDefinitions(GetPresetsList(this, this.state))
    this.setFeedbackDefinitions(GetFeedbacksList(this, this.state))
    this.setActions(GetActionsList(this.state))

    this.checkFeedbacks()
  }

  /**
   * Process an updated configuration array.
   */
  public updateConfig(config: DeviceConfig) {
    this.config = config

    if (this.connecting) {
      this.needsReconnect = true
      return
    }

    if (this.unsubscribeEntities) {
      this.unsubscribeEntities()
    }

    try {
      if (this.client) {
        this.client.close()
      }
    } catch (e) {
      // Ignore
    }

    this.initDone = false
    this.state = {}
    updateVariables(this, this.state)
    this.checkFeedbacks()

    this.tryConnect()
  }

  public upgradeConfig() {
    // Nothing to do
  }

  /**
   * Executes the provided action.
   */
  public action(action: CompanionActionEvent) {
    if (this.client) {
      HandleAction(this, this.client, this.state, action)
    }
  }

  /**
   * Creates the configuration fields for web config.
   */
  public config_fields(): CompanionConfigField[] {
    return GetConfigFields()
  }

  /**
   * Clean up the instance before it is destroyed.
   */
  public destroy() {
    try {
      if (this.unsubscribeEntities) {
        this.unsubscribeEntities()
        this.unsubscribeEntities = undefined
      }
      if (this.client) {
        this.client.close()
        this.client = undefined
      }
    } catch (e) {
      // Ignore
    }

    this.needsReconnect = false
    this.initDone = false
    this.state = {}

    this.debug('destroy', this.id)
    this.status(this.STATUS_UNKNOWN)
  }

  /**
   * Processes a feedback state.
   */
  public feedback(feedback: CompanionFeedbackEvent): CompanionFeedbackResult {
    return ExecuteFeedback(this, this.state, feedback)
  }

  private tryConnect() {
    if (this.connecting || this.client) {
      return
    }

    this.needsReconnect = false

    const auth = new Auth({
      access_token: this.config.access_token || '',
      expires: Date.now() + 1e11,
      hassUrl: this.config.url || ''
    } as any)

    this.connecting = true
    createConnection({
      auth,
      createSocket: () => createSocket(auth, this.config.ignore_certificates || false, this)
    })
      .then(connection => {
        this.client = connection
        this.connecting = false
        this.status(this.STATUS_OK)

        this.log('info', `Connected to v${connection.haVersion}`)

        connection.addEventListener('disconnected', () => {
          this.connecting = true
          this.status(this.STATUS_ERROR, 'Lost connection')
          this.log('info', `Lost connection`)
        })
        connection.addEventListener('ready', () => {
          this.connecting = false
          this.status(this.STATUS_OK)
          this.log('info', `Reconnected to v${connection.haVersion}`)
        })
        connection.addEventListener('reconnect-error', () => {
          this.connecting = false
          this.status(this.STATUS_ERROR, 'Reconnect failed')
          this.log('info', `Reconnect failed`)
        })

        this.unsubscribeEntities = subscribeEntities(connection, this.processStateChange.bind(this))
      })
      .catch((e: number | string) => {
        if (this.needsReconnect) {
          // Restart the process with the new url
          setImmediate(() => this.tryConnect())
          return
        }

        const errorMsg = isNumber(e) ? hassErrorToString(e) : e
        this.connecting = false
        this.client = undefined
        this.status(this.STATUS_ERROR, errorMsg)
        this.log('error', `Connect failed: ${errorMsg}`)

        // Try and reset connection
        setTimeout(() => this.tryConnect(), RECONNECT_INTERVAL)
      })
  }

  /**
   * Handle state changes
   */
  private processStateChange(newState: HassEntities) {
    const entitiesChanged =
      JSON.stringify(Object.keys(this.state).sort()) !== JSON.stringify(Object.keys(newState).sort())

    this.state = newState
    this.initDone = true

    updateVariables(this, this.state)

    if (entitiesChanged) {
      this.setPresetDefinitions(GetPresetsList(this, this.state))
      this.setFeedbackDefinitions(GetFeedbacksList(this, this.state))
      this.setActions(GetActionsList(this.state))
    }

    this.checkFeedbacks()
  }
}

export = ControllerInstance
