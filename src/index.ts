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

class ControllerInstance extends InstanceSkel<DeviceConfig> {
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
      // TODO - queue a reconnect upon current connection completing/failing
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

    const authToken = {
      access_token: config.access_token || '',
      expires: Date.now() + 1e11,
      hassUrl: config.url || ''
    }

    this.initDone = false
    this.state = {}
    updateVariables(this, this.state)
    this.checkFeedbacks()

    this.connecting = true
    createConnection({
      auth: new Auth(authToken as any),
      createSocket
    })
      .then(connection => {
        this.client = connection
        this.connecting = false
        this.status(this.STATUS_OK)

        // TODO - listen for disconnect etc

        this.unsubscribeEntities = subscribeEntities(connection, this.processStateChange.bind(this))
      })
      .catch((e: number | string) => {
        const errorMsg = isNumber(e) ? hassErrorToString(e) : e
        this.connecting = false
        this.status(this.STATUS_ERROR, errorMsg)

        // TODO - try reconnect?
      })
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
      }
      if (this.client) {
        this.client.close()
      }
    } catch (e) {
      // Ignore
    }

    this.debug('destroy', this.id)
  }

  /**
   * Processes a feedback state.
   */
  public feedback(feedback: CompanionFeedbackEvent): CompanionFeedbackResult {
    return ExecuteFeedback(this, this.state, feedback)
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