import { Context, Schema } from 'koishi'
import { Message } from './message'

export const name = 'messages-slim'

export interface Config {
  listeners: ('message' | 'message-deleted' | 'message-updated')[]
}

export const Config: Schema<Config> = Schema.object({
  listeners: Schema.array(Schema.union([
    Schema.const('message'),
    Schema.const('message-deleted'),
    Schema.const('message-updated')
  ]))
    .default(['message', 'message-deleted', 'message-updated'])
    .role('checkbox')
    .description('有什么呢')
})

export const inject = ["database"]

declare module 'koishi' {
  interface Tables {
    messages: Message
  }
}

export function apply(ctx: Context, config: Config) {
  ctx.i18n.define('zh-CN', require('./locales/zh-CN'))
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
  config.listeners.includes('message') && ctx.on('message', async (session) => {
    const msg = Message.fromSession(session)
    await ctx.database.create('messages', msg)
  });
  config.listeners.includes('message-deleted') && ctx.on('message-deleted', async (session) => {
    await ctx.database.set('messages', {
      messageId: session.messageId,
      platform: session.platform,
    }, {
      deleted: 1,
      lastUpdated: new Date(),
    })
  });
  config.listeners.includes('message-updated') && ctx.on('message-updated', async (session) => {
    await ctx.database.set('messages', {
      messageId: session.messageId,
      platform: session.platform,
    }, {
      content: session.content,
      lastUpdated: new Date(),
    })
  });
}

export * from './message'
