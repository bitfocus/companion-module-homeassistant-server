import * as WebSocket from 'ws'

import {
  ConnectionOptions,
  ERR_CANNOT_CONNECT,
  ERR_CONNECTION_LOST,
  ERR_HASS_HOST_REQUIRED,
  ERR_INVALID_AUTH,
  Error
} from 'home-assistant-js-websocket'
import { MessageEvent } from 'ws'

const DEBUG = true

const MSG_TYPE_AUTH_REQUIRED = 'auth_required'
const MSG_TYPE_AUTH_INVALID = 'auth_invalid'
const MSG_TYPE_AUTH_OK = 'auth_ok'

export function hassErrorToString(e: number) {
  switch (e) {
    case ERR_CANNOT_CONNECT:
      return 'ERR_CANNOT_CONNECT'
    case ERR_INVALID_AUTH:
      return 'ERR_INVALID_AUTH'
    case ERR_CONNECTION_LOST:
      return 'ERR_CONNECTION_LOST'
    case ERR_HASS_HOST_REQUIRED:
      return 'ERR_HASS_HOST_REQUIRED'
    default:
      return `UNKNOWN ${e}`
  }
}

export function createSocket(options: ConnectionOptions): Promise<any> {
  if (!options.auth) {
    throw ERR_HASS_HOST_REQUIRED
  }
  const auth = options.auth

  // Start refreshing expired tokens even before the WS connection is open.
  // We know that we will need auth anyway.
  // let authRefreshTask = auth.expired
  //   ? auth.refreshAccessToken().then(
  //       () => {
  //         authRefreshTask = undefined
  //       },
  //       () => {
  //         authRefreshTask = undefined
  //       }
  //     )
  //   : undefined

  // Convert from http:// -> ws://, https:// -> wss://
  const url = auth.wsUrl

  if (DEBUG) {
    console.log('[Auth phase] Initializing', url)
  }

  function connect(triesLeft: number, promResolve: (socket: WebSocket) => void, promReject: (err: Error) => void) {
    if (DEBUG) {
      console.log('[Auth Phase] New connection', url)
    }

    const socket = new WebSocket(url)

    // If invalid auth, we will not try to reconnect.
    let invalidAuth = false

    const closeMessage = () => {
      // If we are in error handler make sure close handler doesn't also fire.
      socket.removeEventListener('close', closeMessage)
      if (invalidAuth) {
        promReject(ERR_INVALID_AUTH)
        return
      }

      // Reject if we no longer have to retry
      if (triesLeft === 0) {
        // We never were connected and will not retry
        promReject(ERR_CANNOT_CONNECT)
        return
      }

      const newTries = triesLeft === -1 ? -1 : triesLeft - 1
      // Try again in a second
      setTimeout(() => connect(newTries, promResolve, promReject), 1000)
    }

    // Auth is mandatory, so we can send the auth message right away.
    const handleOpen = async () => {
      try {
        // if (auth.expired) {
        //   await (authRefreshTask ? authRefreshTask : auth.refreshAccessToken())
        // }
        socket.send(
          JSON.stringify({
            type: 'auth',
            access_token: auth.accessToken
          })
        )
      } catch (err) {
        // Refresh token failed
        invalidAuth = err === ERR_INVALID_AUTH
        socket.close()
      }
    }

    const handleMessage = async (event: MessageEvent) => {
      const message = JSON.parse(event.data.toString())

      if (DEBUG) {
        console.log('[Auth phase] Received', message)
      }
      switch (message.type) {
        case MSG_TYPE_AUTH_INVALID:
          invalidAuth = true
          socket.close()
          break

        case MSG_TYPE_AUTH_OK:
          socket.removeEventListener('open', handleOpen)
          socket.removeEventListener('message', handleMessage)
          socket.removeEventListener('close', closeMessage)
          socket.removeEventListener('error', closeMessage)
          promResolve(socket)
          break

        default:
          if (DEBUG) {
            // We already send this message when socket opens
            if (message.type !== MSG_TYPE_AUTH_REQUIRED) {
              console.warn('[Auth phase] Unhandled message', message)
            }
          }
      }
    }

    socket.addEventListener('open', handleOpen)
    socket.addEventListener('message', handleMessage)
    socket.addEventListener('close', closeMessage)
    socket.addEventListener('error', closeMessage)
  }

  return new Promise((resolve, reject) => connect(options.setupRetry, resolve, reject))
}
