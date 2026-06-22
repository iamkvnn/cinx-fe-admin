import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { env } from '@/config/env'
import { getNotificationFrontendUrl } from '@/utils/notificationHelper'

export function useNotificationWebSocket(accessToken: string | null) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!accessToken) {
      if (clientRef.current) {
        clientRef.current.deactivate()
        clientRef.current = null
      }
      return
    }

    // Determine the base WebSocket URL from env.API_URL
    let brokerURL = ''
    if (env.API_URL.startsWith('http')) {
      brokerURL = env.API_URL.replace(/^http/, 'ws') + '/ws/notifications'
    } else {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      brokerURL = `${wsProtocol}//${window.location.host}/ws/notifications`
    }

    const client = new Client({
      brokerURL,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str) => {
        console.log('[STOMP]', str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = (frame) => {
      console.log('[STOMP] Connected successfully', frame)

      // Subscribe to user-specific notifications
      client.subscribe('/user/queue/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body)
          console.log('[STOMP] Received notification:', notification)

          // Display visual notification via toast
          toast.info(notification.title || 'Thông báo mới', {
            description: notification.message || '',
            duration: 6000,
            action: {
              label: 'Xem',
              onClick: () => {
                const url = getNotificationFrontendUrl(notification)
                if (url) {
                  if (url.startsWith("http")) {
                    window.open(url, "_blank")
                  } else {
                    navigate(url)
                  }
                }
              }
            }
          })

          // Invalidate cache queries so UI updates automatically
          queryClient.invalidateQueries({ queryKey: ['unread-count'] })
          queryClient.invalidateQueries({ queryKey: ['header-notifications'] })
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        } catch (error) {
          console.error('[STOMP] Error parsing message body:', error)
        }
      })
    }

    client.onStompError = (frame) => {
      console.error('[STOMP] Broker error:', frame.headers['message'])
      console.error('[STOMP] Details:', frame.body)
    }

    client.onWebSocketClose = () => {
      console.log('[STOMP] Connection closed')
    }

    client.activate()
    clientRef.current = client

    return () => {
      console.log('[STOMP] Deactivating connection...')
      client.deactivate()
      clientRef.current = null
    }
  }, [accessToken, queryClient])
}
