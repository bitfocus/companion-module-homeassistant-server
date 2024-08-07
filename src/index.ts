import {
	Connection,
	createConnection,
	UnsubscribeFunc,
	subscribeServices,
	HassServices,
	createLongLivedTokenAuth,
	HassEntity,
	HassEntities,
} from 'home-assistant-js-websocket'
import { GetActionsList } from './actions.js'
import { type DeviceConfig, GetConfigFields } from './config.js'
import { FeedbackId, GetFeedbacksList } from './feedback.js'
import { createSocket, hassErrorToString } from './hass-socket.js'
import { GetPresetsList } from './presets.js'
import { InitVariables, updateVariables } from './variables.js'
import { InstanceBase, InstanceStatus, runEntrypoint, SomeCompanionConfigField } from '@companion-module/base'
import { UpgradeScripts } from './upgrades.js'
import { stripTrailingSlash } from './util.js'
import { HassEntitiesWithChanges, entitiesColl } from './hass/entities.js'
import { EntitySubscriptions } from './state.js'
import debounceFn from 'debounce-fn'

const RECONNECT_INTERVAL = 5000

class ControllerInstance extends InstanceBase<DeviceConfig> {
	public needsReconnect: boolean

	private config: DeviceConfig
	private state: HassEntity[]
	private stateObj: HassEntities
	private services: HassServices
	private entitySubscriptions = new EntitySubscriptions()
	private client: Connection | undefined
	private connecting: boolean
	private unsubscribeEntities: UnsubscribeFunc | undefined
	private unsubscribeServices: UnsubscribeFunc | undefined

	private pendingState: HassEntitiesWithChanges | undefined

	constructor(internal: unknown) {
		super(internal)

		this.config = {}
		this.connecting = false
		this.state = []
		this.stateObj = {}
		this.services = {}
		this.needsReconnect = false
	}

	// Override base types to make types stricter
	public checkFeedbacks(...feedbackTypes: FeedbackId[]): void {
		super.checkFeedbacks(...feedbackTypes)
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 */
	public async init(config: DeviceConfig): Promise<void> {
		this.config = config

		await this.configUpdated(this.config)

		InitVariables(this, this.state)
		this.setPresetDefinitions(GetPresetsList(this.state))
		this.setFeedbackDefinitions(GetFeedbacksList(this.state, () => this.stateObj, this.entitySubscriptions))
		this.setActionDefinitions(
			GetActionsList(() => ({ state: this.state, services: this.services, client: this.client }))
		)
		// updateVariables(this, this.state) No need, there are no entities
	}

	/**
	 * Process an updated configuration array.
	 */
	public async configUpdated(config: DeviceConfig): Promise<void> {
		this.config = config

		if (this.connecting) {
			this.needsReconnect = true
			return
		}

		if (this.unsubscribeEntities) {
			this.unsubscribeEntities()
		}
		if (this.unsubscribeServices) {
			this.unsubscribeServices()
		}

		try {
			if (this.client) {
				this.client.close()
			}
		} catch (e) {
			// Ignore
		}
		this.client = undefined

		this.state = []
		this.stateObj = {}
		this.services = {}
		// updateVariables(this, this.state) No need, there are no entities

		this.tryConnect()

		// Re-init the subscriptions
		this.entitySubscriptions.clear()
		this.subscribeFeedbacks()
	}

	/**
	 * Creates the configuration fields for web config.
	 */
	public getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	/**
	 * Clean up the instance before it is destroyed.
	 */
	public async destroy(): Promise<void> {
		try {
			if (this.unsubscribeEntities) {
				this.unsubscribeEntities()
				this.unsubscribeEntities = undefined
			}
			if (this.unsubscribeServices) {
				this.unsubscribeServices()
				this.unsubscribeServices = undefined
			}

			if (this.client) {
				this.client.close()
			}
		} catch (e) {
			// Ignore
		}
		this.client = undefined

		this.needsReconnect = false
		this.state = []
		this.stateObj = {}
		this.services = {}

		this.log('debug', `destroy ${this.id}`)
	}

	private tryConnect(): void {
		if (this.connecting || this.client) {
			return
		}

		this.connecting = true
		this.needsReconnect = false

		const auth = createLongLivedTokenAuth(stripTrailingSlash(this.config.url || ''), this.config.access_token || '')

		createConnection({
			auth,
			createSocket: async () => createSocket(auth, this.config.ignore_certificates || false, this),
		})
			.then((connection) => {
				this.connecting = false

				// Need reconnection already?
				if (this.needsReconnect) {
					try {
						connection.close()
					} catch (e) {
						// Ignore
					}
					// Restart the process with the new url
					setImmediate(() => this.tryConnect())
					return
				}

				this.client = connection
				this.updateStatus(InstanceStatus.Ok)

				this.log('info', `Connected to v${connection.haVersion}`)

				connection.addEventListener('disconnected', () => {
					this.connecting = true
					this.updateStatus(InstanceStatus.Disconnected, 'Lost connection')
					this.log('info', `Lost connection`)
				})
				connection.addEventListener('ready', () => {
					this.connecting = false
					this.updateStatus(InstanceStatus.Ok)
					this.log('info', `Reconnected to v${connection.haVersion}`)
				})
				connection.addEventListener('reconnect-error', () => {
					this.connecting = false
					this.updateStatus(InstanceStatus.ConnectionFailure, 'Reconnect failed')
					this.log('info', `Reconnect failed`)
				})

				this.unsubscribeServices = subscribeServices(connection, this.processServicesChange.bind(this))
				this.unsubscribeEntities = entitiesColl(connection).subscribe(this.deboundProcessStateChange.bind(this))
			})
			.catch((e: number | string) => {
				this.connecting = false
				this.client = undefined

				if (this.needsReconnect) {
					// Restart the process with the new url
					setImmediate(() => this.tryConnect())
					return
				}

				const errorMsg = typeof e === 'number' ? hassErrorToString(e) : e
				this.client = undefined
				this.updateStatus(InstanceStatus.UnknownError, errorMsg)
				this.log('error', `Connect failed: ${errorMsg}`)

				// Try and reset connection
				setTimeout(() => this.tryConnect(), RECONNECT_INTERVAL)
			})
	}

	private deboundProcessStateChange = (newState: HassEntitiesWithChanges): void => {
		if (!this.pendingState) {
			this.pendingState = newState
		} else {
			// Perform an intelligent merge of the changes, factoring in how multiple updates should compound

			this.pendingState.entities = newState.entities

			for (const id of newState.added) {
				this.pendingState.added.add(id)
				this.pendingState.removed.delete(id)
				this.pendingState.contentChanged.delete(id)
				this.pendingState.friendlyNameChange.delete(id)
			}

			for (const id of newState.removed) {
				this.pendingState.contentChanged.delete(id)
				this.pendingState.friendlyNameChange.delete(id)
				this.pendingState.added.delete(id)
				this.pendingState.removed.add(id) // Be safe and always mark as removed, should be cheap to do this
			}

			for (const id of newState.contentChanged) {
				if (!this.pendingState.added.has(id)) {
					this.pendingState.contentChanged.add(id)
					this.pendingState.removed.delete(id)
				}
			}
			for (const id of newState.friendlyNameChange) {
				if (!this.pendingState.added.has(id)) {
					this.pendingState.friendlyNameChange.add(id)
					this.pendingState.removed.delete(id)
				}
			}
		}

		this.processStateChange()
	}

	/**
	 * Handle state changes
	 * Note: This must not be debounced directly, as then the added/changed/removed will be incorrect
	 */
	private processStateChange = debounceFn(
		(): void => {
			const newState = this.pendingState
			this.pendingState = undefined
			if (!newState) return

			const newEntities = Object.values(newState.entities).sort((a, b) => a.entity_id.localeCompare(b.entity_id))
			this.state = newEntities
			this.stateObj = newState.entities

			const entitiesChanged =
				newState.added.size > 0 || newState.removed.size > 0 || newState.friendlyNameChange.size > 0
			if (entitiesChanged) {
				this.setPresetDefinitions(GetPresetsList(this.state))
				this.setFeedbackDefinitions(GetFeedbacksList(this.state, () => this.stateObj, this.entitySubscriptions))
				this.setActionDefinitions(
					GetActionsList(() => ({ state: this.state, client: this.client, services: this.services }))
				)
				InitVariables(this, this.state)
			}

			updateVariables(this, newState)

			this.#checkAffectedFeedbacks(newState)
		},
		{
			wait: 10,
			maxWait: 50,
			before: false,
			after: true,
		}
	)

	#checkAffectedFeedbacks(newState: HassEntitiesWithChanges) {
		const changedFeedbackInstanceIds = new Set<string>()

		const checkEntityIds = (entityIds: Set<string>) => {
			for (const entityId of entityIds) {
				const instanceIds = this.entitySubscriptions.getFeedbackInstanceIds(entityId)
				for (const instanceId of instanceIds) {
					changedFeedbackInstanceIds.add(instanceId)
				}
			}
		}

		checkEntityIds(newState.added)
		checkEntityIds(newState.contentChanged)
		checkEntityIds(newState.removed)
		// No feedback based on the friendly name

		if (changedFeedbackInstanceIds.size > 0) {
			this.checkFeedbacksById(...changedFeedbackInstanceIds)
		}
	}

	private processServicesChange(services: HassServices): void {
		this.services = services

		this.setActionDefinitions(
			GetActionsList(() => ({ state: this.state, client: this.client, services: this.services }))
		)
	}
}

runEntrypoint(ControllerInstance, UpgradeScripts)
