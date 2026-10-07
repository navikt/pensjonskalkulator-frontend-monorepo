import { type Environment, builtinEnvironments } from 'vitest/environments'

// jsdom overrides AbortController/AbortSignal, but fetch/Request come from Node (undici),
// which since Node 24 rejects signals that are not its own AbortSignal instances.
export default {
  ...builtinEnvironments.jsdom,
  name: 'jsdom-node-abort',
  async setup(global: typeof globalThis, options) {
    const { AbortController, AbortSignal } = global
    const env = await builtinEnvironments.jsdom.setup(global, options)
    global.AbortController = AbortController
    global.AbortSignal = AbortSignal
    return env
  },
} satisfies Environment
