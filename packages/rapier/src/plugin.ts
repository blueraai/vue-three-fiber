import { defineFiberPlugin, withPluginOptions } from '@vue-three/fiber'
import { RAPIER_DEFAULTS, type RapierPluginOptions } from './context'

export const rapierFiberPlugin = defineFiberPlugin<RapierPluginOptions | void>({
  name: '@vue-three/rapier',
  setup(ctx, options) {
    if (options) {
      ctx.provide(RAPIER_DEFAULTS, options)
    }
  },
})

export function createRapierPlugin(options?: RapierPluginOptions) {
  return withPluginOptions(rapierFiberPlugin, options)
}
