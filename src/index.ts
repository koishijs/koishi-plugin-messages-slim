import { Context, Schema } from 'koishi'
import { Message } from './message'

export const name = 'messages-slim'

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

export const inject = ["database"]

declare module 'koishi' {
  interface Tables {
    messages: Message
  }
}

export function apply(ctx: Context) {
  ctx.model.extend('messages', {
    id: 'string',
    content: 'text',
    platform: 'string',
    messageId: 'string',
    userId: 'string',
    timestamp: 'timestamp',
    quoteId: 'string',
    username: 'string',
    nickname: 'string',
    channelId: 'string',
    lastUpdated: 'timestamp',
    deleted: 'integer',
    avatar: 'string',
  })
  ctx.on('message', async (session) => {
    const msg = Message.fromSession(session)
    await ctx.database.create('messages', msg)
  })
  ctx.on('message-deleted', async (session) => {
    await ctx.database.set('messages', {
      messageId: session.messageId,
      platform: session.platform,
    }, {
      deleted: 1,
      lastUpdated: new Date(),
    })
  })
  ctx.on('message-updated', async (session) => {
    await ctx.database.set('messages', {
      messageId: session.messageId,
      platform: session.platform,
    }, {
      content: session.content,
      lastUpdated: new Date(),
    })
  })
}

export * from './message'
