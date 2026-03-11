<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { codeToHtml } from 'shiki'
import GlassFlowerDemo from './GlassFlowerDemo'
// @ts-expect-error raw import resolved by Vite
import glassFlowerSource from './GlassFlowerDemo.tsx?raw'

// ---------------------------------------------------------------------------
// Raw source imports via import.meta.glob (Vite resolves these at build time)
// ---------------------------------------------------------------------------
const rawModules = import.meta.glob('../../../../example/src/demos/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

/** Extract demo name from glob path */
function sourceFor(name: string): string {
  for (const [path, content] of Object.entries(rawModules)) {
    if (path.endsWith(`/${name}.tsx`)) return content
  }
  return `// Source not found for ${name}`
}

// ---------------------------------------------------------------------------
// Demo registry
// ---------------------------------------------------------------------------

interface DemoEntry {
  title: string
  height: number
  description: string
  component: ReturnType<typeof defineAsyncComponent> | ReturnType<typeof import('vue')['defineComponent']>
  source: string
  originalDemo?: {
    label: string
    url: string
  }
}

const demos: Record<string, DemoEntry> = {
  GlassFlower: {
    title: 'GlassFlower',
    height: 640,
    description:
      'A polished showcase scene with local GLTF, HDRI lighting, postprocessing, and orbit controls. This is the heaviest docs demo and the closest thing to a hero piece.',
    component: GlassFlowerDemo,
    source: glassFlowerSource,
  },
  SpaceGame: {
    title: 'Space Game',
    height: 620,
    description:
      'A Vue refactor of the desktop space-runner demo: procedural starfield, spline track, ship steering, enemy drones, rocks, score HUD, and click-to-fire gameplay in one docs-hosted scene.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/SpaceGame')),
    source: sourceFor('SpaceGame'),
    originalDemo: {
      label: 'Original React version',
      url: 'https://codesandbox.io/s/i2160',
    },
  },
  Test: {
    title: 'Test',
    height: 420,
    description:
      'Foundational conditional rendering, ref lifecycle, and interaction behavior. This is the minimal sanity-check scene for the renderer itself.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/Test')),
    source: sourceFor('Test'),
  },
  ClickAndHover: {
    title: 'Click & Hover',
    height: 420,
    description:
      'Pointer events, click handling, and mixing declarative nodes with primitive Three objects in one scene.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/ClickAndHover')),
    source: sourceFor('ClickAndHover'),
  },
  ContextMenuOverride: {
    title: 'Context Menu Override',
    height: 380,
    description:
      'Custom right-click interactions in 3D space, including suppressing the browser context menu and mapping it to scene behavior.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/ContextMenuOverride')),
    source: sourceFor('ContextMenuOverride'),
  },
  SceneServices: {
    title: 'Scene Services',
    height: 520,
    description:
      'Shared state across the scene and the DOM overlay using provide/inject. Click a shape to select it, then drive the selection state from the overlay controls.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/SceneServices')),
    source: sourceFor('SceneServices'),
  },
  DomOverlay: {
    title: 'DOM Overlay',
    height: 460,
    description:
      'Canvas overlay slots keep the 3D scene and the interface in one Vue app. Adjust the color and speed in the overlaid controls and the scene updates immediately.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/DomOverlay')),
    source: sourceFor('DomOverlay'),
  },
  ObjectHandles: {
    title: 'Object Handles',
    height: 420,
    description:
      'useObjectRef gives you explicit access to the raw THREE object while keeping the authoring model declarative. This is the preferred imperative pattern for new code.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/ObjectHandles')),
    source: sourceFor('ObjectHandles'),
  },
  DemandRendering: {
    title: 'Demand Rendering',
    height: 420,
    description:
      'watchInvalidate pairs Vue reactivity with frameloop="demand" so the scene only redraws when state actually changes. Use the overlay button or click the torus knot to cycle colors.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/DemandRendering')),
    source: sourceFor('DemandRendering'),
  },
  AutoDispose: {
    title: 'Auto Dispose',
    height: 420,
    description:
      'Automatic disposal of Three objects when conditional scene branches unmount, with interaction-driven state changes to prove cleanup stays correct.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/AutoDispose')),
    source: sourceFor('AutoDispose'),
  },
  Layers: {
    title: 'Layers',
    height: 420,
    description:
      'Selective visibility with Three.js layers and camera filtering, demonstrated as timed visibility swaps.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/Layers')),
    source: sourceFor('Layers'),
  },
  MultiMaterial: {
    title: 'Multi Material',
    height: 520,
    description:
      'Multiple material slots on one geometry, shared material reuse, and dynamic geometry/material replacement.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/MultiMaterial')),
    source: sourceFor('MultiMaterial'),
  },
  MultiRender: {
    title: 'Multi Render',
    height: 560,
    description:
      'Two independent Canvas instances on one page, showing separate stores, renderers, and lifecycle timing in the same Vue view.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/MultiRender')),
    source: sourceFor('MultiRender'),
  },
  Pointcloud: {
    title: 'Pointcloud',
    height: 460,
    description:
      'A custom shader-driven interactive point cloud with per-point hover feedback using buffer geometry and raycaster indices.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/Pointcloud')),
    source: sourceFor('Pointcloud'),
  },
  Reparenting: {
    title: 'Reparenting',
    height: 460,
    description:
      'Dynamic createPortal reparenting without destroying objects, useful for scene graph orchestration and view transitions.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/Reparenting')),
    source: sourceFor('Reparenting'),
  },
  ResetProps: {
    title: 'Reset Props',
    height: 480,
    description:
      'Adaptive DPR, dynamic geometry replacement, and prop-reset behavior under ongoing animation and interaction.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/ResetProps')),
    source: sourceFor('ResetProps'),
  },
  SceneSwap: {
    title: 'Scene Swap',
    height: 460,
    description:
      'Swap entire scene branches without remounting the Canvas. This is a lightweight example of scene-level transitions and view switching.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/SceneSwap')),
    source: sourceFor('SceneSwap'),
  },
  LoaderTransition: {
    title: 'Loader Transition',
    height: 460,
    description:
      'A Vue-first loading flow with a visible placeholder and an explicit transition into the loaded content, without leaning on Suspense semantics.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/LoaderTransition')),
    source: sourceFor('LoaderTransition'),
  },
  ScreenCapture: {
    title: 'Screen Capture',
    height: 420,
    description:
      'Frame-synchronized screenshot capture using render lifecycle composables, proving scene updates are committed before pixels are read.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/ScreenCapture')),
    source: sourceFor('ScreenCapture'),
  },
  StopPropagation: {
    title: 'Stop Propagation',
    height: 460,
    description:
      'Nested pointer interactions with stopPropagation, demonstrating event routing and hover behavior across scene hierarchies.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/StopPropagation')),
    source: sourceFor('StopPropagation'),
  },
  SVGRenderer: {
    title: 'SVG Renderer',
    height: 460,
    description:
      'Alternative renderer support with Three.js SVGRenderer instead of WebGL, showing the renderer abstraction is not WebGL-only.',
    component: defineAsyncComponent(() => import('../../../../example/src/demos/SVGRenderer')),
    source: sourceFor('SVGRenderer'),
  },
}

type DemoKey = keyof typeof demos

// ---------------------------------------------------------------------------
// Hash ↔ demo key helpers
// ---------------------------------------------------------------------------

/** Convert PascalCase key to kebab-case slug for the URL hash */
function toSlug(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** Reverse lookup: slug → demo key */
const slugToKey: Record<string, DemoKey> = {}
for (const key of Object.keys(demos)) {
  slugToKey[toSlug(key)] = key as DemoKey
}

function keyFromHash(): DemoKey | null {
  const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#/, '') : ''
  return slugToKey[hash] ?? null
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const selected = ref<DemoKey>(keyFromHash() ?? 'GlassFlower')
const selectedDemo = computed(() => demos[selected.value])

/** Which inner tab is active: 'demo' or 'source' */
const viewTab = ref<'demo' | 'source'>('demo')

/** Cached highlighted HTML per demo key */
const highlightCache = new Map<string, string>()

/** Current highlighted HTML to render */
const highlightedHtml = shallowRef('')

/** Whether we're currently highlighting */
const highlighting = ref(false)

// Sync selected → hash (skip during programmatic back/forward updates)
let suppressHashSync = false
watch(selected, (key) => {
  viewTab.value = 'demo'
  if (!suppressHashSync && typeof window !== 'undefined') {
    history.replaceState(null, '', `#${toSlug(key)}`)
  }
})

// Sync hash → selected on back/forward navigation
function onHashChange() {
  const key = keyFromHash()
  if (key && key !== selected.value) {
    suppressHashSync = true
    selected.value = key
    suppressHashSync = false
  }
}

onMounted(() => {
  window.addEventListener('hashchange', onHashChange)
  // Set initial hash if none present
  if (!window.location.hash) {
    history.replaceState(null, '', `#${toSlug(selected.value)}`)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
})

// Highlight source on demand
watch(
  [selected, viewTab],
  async ([key, tab]) => {
    if (tab !== 'source') return

    // Use cache if available
    if (highlightCache.has(key)) {
      highlightedHtml.value = highlightCache.get(key)!
      return
    }

    highlighting.value = true
    try {
      const source = demos[key as DemoKey].source
      const html = await codeToHtml(source, {
        lang: 'tsx',
        themes: {
          light: 'github-light',
          dark: 'github-dark-dimmed',
        },
      })
      highlightCache.set(key, html)
      highlightedHtml.value = html
    } finally {
      highlighting.value = false
    }
  },
  { immediate: true },
)

// Line count for display
const lineCount = computed(() => {
  const source = demos[selected.value as DemoKey]?.source
  return source ? source.split('\n').length : 0
})

// ---------------------------------------------------------------------------
// stats.js — mrdoob's standard FPS/MS/MB panel
// Lazy-imported to avoid SSR failures (stats.js touches DOM at import time).
// ---------------------------------------------------------------------------
import { addEffect, addAfterEffect } from '@vue-three/fiber'

const stageEl = ref<HTMLElement | null>(null)
let stats: any = null
let unsubBefore: (() => void) | null = null
let unsubAfter: (() => void) | null = null

function initStats(container: HTMLElement) {
  import('stats.js').then((mod) => {
    const Stats = mod.default
    stats = new Stats()
    stats.showPanel(0)
    stats.dom.style.position = 'absolute'
    stats.dom.style.top = '0'
    stats.dom.style.right = '0'
    stats.dom.style.left = 'auto'
    stats.dom.style.pointerEvents = 'none'
    stats.dom.style.zIndex = '10'
    container.appendChild(stats.dom)

    unsubBefore = addEffect(() => {
      stats?.begin()
    })
    unsubAfter = addAfterEffect(() => {
      stats?.end()
    })
  })
}

function teardownStats() {
  unsubBefore?.()
  unsubAfter?.()
  stats?.dom?.remove()
  stats = null
  unsubBefore = null
  unsubAfter = null
}

// Watch the template ref — it only resolves after ClientOnly renders
watch(stageEl, (el) => {
  if (el && !stats) initStats(el)
})

onBeforeUnmount(teardownStats)
</script>

<template>
  <div class="docs-examples">
    <div class="docs-examples__header">
      <p class="docs-examples__lede">
        Every shipped demo now compiles directly into the docs site. This page is the canonical example surface for the
        project.
      </p>
      <div class="docs-examples__nav">
        <button
          v-for="(demo, key) in demos"
          :key="key"
          type="button"
          class="docs-examples__tab"
          :class="{ 'docs-examples__tab--active': selected === key }"
          @click="selected = key as DemoKey">
          {{ demo.title }}
        </button>
      </div>
    </div>

    <div class="docs-examples__panel">
      <div class="docs-examples__meta">
        <h2>{{ selectedDemo.title }}</h2>
        <p>{{ selectedDemo.description }}</p>
      </div>

      <!-- Inner view tabs: Demo / Source -->
      <div class="docs-examples__view-tabs">
        <button
          type="button"
          class="docs-examples__view-tab"
          :class="{ 'docs-examples__view-tab--active': viewTab === 'demo' }"
          @click="viewTab = 'demo'">
          Demo
        </button>
        <button
          type="button"
          class="docs-examples__view-tab"
          :class="{ 'docs-examples__view-tab--active': viewTab === 'source' }"
          @click="viewTab = 'source'">
          Source
          <span class="docs-examples__view-tab-badge">TSX</span>
        </button>
      </div>

      <!-- Demo view -->
      <div
        v-show="viewTab === 'demo'"
        ref="stageEl"
        class="docs-examples__stage"
        :style="{ minHeight: `${selectedDemo.height}px` }">
        <ClientOnly>
          <component :is="selectedDemo.component" />
        </ClientOnly>
      </div>
      <p v-if="viewTab === 'demo' && selectedDemo.originalDemo" class="docs-examples__credit">
        {{ selectedDemo.originalDemo.label }}:
        <a :href="selectedDemo.originalDemo.url" target="_blank" rel="noreferrer noopener">
          {{ selectedDemo.originalDemo.url }}
        </a>
      </p>

      <!-- Source view -->
      <div v-show="viewTab === 'source'" class="docs-examples__code-wrap">
        <div class="docs-examples__code-header">
          <span class="docs-examples__code-filename">{{ selected }}.tsx</span>
          <span class="docs-examples__code-lines">{{ lineCount }} lines</span>
        </div>
        <div v-if="highlighting" class="docs-examples__code-loading">Loading syntax highlighting...</div>
        <div v-else class="docs-examples__code-container" v-html="highlightedHtml" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.docs-examples {
  display: grid;
  gap: 1rem;
}

.docs-examples__header {
  display: grid;
  gap: 0.9rem;
}

.docs-examples__lede {
  margin: 0;
  color: var(--vp-c-text-2);
}

.docs-examples__nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.docs-examples__tab {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 0.65rem 0.95rem;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
  transition: background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.docs-examples__tab:hover {
  transform: translateY(-1px);
  border-color: var(--vp-c-brand-1);
}

.docs-examples__tab--active {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
}

.docs-examples__panel {
  display: grid;
  gap: 1rem;
}

.docs-examples__meta h2 {
  margin: 0 0 0.35rem;
}

.docs-examples__meta p {
  margin: 0;
  color: var(--vp-c-text-2);
}

/* --- Inner view tabs --- */

.docs-examples__view-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--vp-c-divider);
}

.docs-examples__view-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1.1rem;
  border: none;
  background: none;
  color: var(--vp-c-text-2);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.18s ease, border-color 0.18s ease;
}

.docs-examples__view-tab:hover {
  color: var(--vp-c-text-1);
}

.docs-examples__view-tab--active {
  color: var(--vp-c-brand-1);
  border-bottom-color: var(--vp-c-brand-1);
}

.docs-examples__view-tab-badge {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1.4;
}

/* --- Demo stage --- */

.docs-examples__stage {
  position: relative;
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 45%),
    linear-gradient(180deg, #12131b 0%, #191b24 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.docs-examples__credit {
  margin: -0.2rem 0 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.docs-examples__credit a {
  color: var(--vp-c-brand-1);
  word-break: break-all;
}

/* --- Code view --- */

.docs-examples__code-wrap {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.docs-examples__code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
}

.docs-examples__code-filename {
  font-family: var(--vp-font-family-mono);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.docs-examples__code-lines {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.docs-examples__code-loading {
  padding: 2rem;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}

.docs-examples__code-container {
  max-height: 600px;
  overflow: auto;
}

/* Style the shiki output to match VitePress code blocks */
.docs-examples__code-container :deep(pre) {
  margin: 0;
  padding: 1rem;
  background: transparent !important;
  overflow-x: auto;
}

.docs-examples__code-container :deep(code) {
  font-family: var(--vp-font-family-mono);
  font-size: 0.85rem;
  line-height: 1.65;
}

/* Shiki dual-theme: light mode uses --shiki-light, dark mode uses --shiki-dark */
.docs-examples__code-container :deep(.shiki) {
  background-color: transparent !important;
}

.docs-examples__code-container :deep(.shiki span) {
  color: var(--shiki-light) !important;
  background-color: var(--shiki-light-bg) !important;
}

:root.dark .docs-examples__code-container :deep(.shiki span),
.dark .docs-examples__code-container :deep(.shiki span) {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}
</style>
