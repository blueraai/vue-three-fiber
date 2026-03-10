import { Canvas, extend, useFrame, useLoader, useObjectRef, useThree, type LoaderResult } from '@vue-three/fiber'
import { defineComponent, h, ref, shallowRef, watch, watchEffect } from 'vue'
import * as THREE from 'three'
import type { Mesh, Object3D, PerspectiveCamera, WebGLRenderer } from 'three'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { LUTCubeLoader } from 'three/addons/loaders/LUTCubeLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { LUTPass } from 'three/addons/postprocessing/LUTPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

type FlowerGLTF = LoaderResult<typeof GLTFLoader> & {
  nodes: Record<string, Object3D>
}

const OrbitControls = extend(OrbitControlsImpl)
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco-gltf/')
dracoLoader.setDecoderConfig({ type: 'js' })

const Controls = defineComponent({
  setup() {
    const camera = useThree((state) => state.camera)
    const gl = useThree((state) => state.gl)
    const controls = ref<OrbitControlsImpl | null>(null)

    useFrame(() => {
      controls.value?.update()
    })

    return () => {
      if (!camera.value || !gl.value) return null

      return (
        <OrbitControls
          ref={controls}
          args={[camera.value as PerspectiveCamera, gl.value.domElement]}
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          target={[0, 0.35, 0]}
        />
      )
    }
  },
})

const StudioEnvironment = defineComponent({
  setup() {
    const hdr = useLoader(RGBELoader, '/blue_photo_studio_1k.hdr')
    const scene = useThree((state) => state.scene)

    watchEffect((onCleanup) => {
      if (!hdr.value || !scene.value) return

      hdr.value.mapping = THREE.EquirectangularReflectionMapping
      const previousEnvironment = scene.value.environment
      scene.value.environment = hdr.value

      onCleanup(() => {
        if (scene.value.environment === hdr.value) {
          scene.value.environment = previousEnvironment
        }
      })
    })

    return () => null
  },
})

const Model = defineComponent({
  setup() {
    const gltf = useLoader(GLTFLoader, '/flower-transformed.glb', (loader) => {
      loader.setDRACOLoader(dracoLoader)
    })
    const root = useObjectRef<THREE.Group>()

    useFrame((_, delta) => {
      if (root.object.value) {
        root.object.value.rotation.y += delta * 0.15
      }
    })

    return () => {
      const asset = gltf.value as FlowerGLTF | null
      const petals = asset?.nodes?.petals as Mesh | undefined
      const innerSphere = asset?.nodes?.Sphere as Mesh | undefined
      const glow = asset?.nodes?.Sphere001 as Mesh | undefined

      if (!petals || !innerSphere || !glow) return null

      return (
        <group ref={root.ref} position={[0, -0.25, 0]} dispose={null}>
          <mesh geometry={petals.geometry}>
            <meshPhysicalMaterial
              color="#f6e5ff"
              side={THREE.DoubleSide}
              transmission={1}
              thickness={0.2}
              ior={1.05}
              roughness={0.02}
              iridescence={1}
              iridescenceIOR={1}
              iridescenceThicknessRange={[0, 1400]}
              clearcoat={1}
              envMapIntensity={1.25}
              attenuationDistance={0.25}
              attenuationColor="#ffffff"
            />
            <mesh geometry={innerSphere.geometry}>
              <meshPhysicalMaterial
                color="#d4d1ff"
                transmission={1}
                thickness={0.9}
                ior={1.2}
                roughness={0}
                clearcoat={1}
                envMapIntensity={1.5}
              />
            </mesh>
          </mesh>
          <mesh geometry={glow.geometry}>
            <meshStandardMaterial toneMapped={false} emissive="hotpink" color="#ff4f73" emissiveIntensity={2} />
          </mesh>
        </group>
      )
    }
  },
})

const PostProcessing = defineComponent({
  setup() {
    const gl = useThree((state) => state.gl)
    const scene = useThree((state) => state.scene)
    const camera = useThree((state) => state.camera)
    const size = useThree((state) => state.size)
    const lut = useLoader(LUTCubeLoader, '/F-6800-STD.cube')
    const composer = shallowRef<EffectComposer | null>(null)

    watchEffect((onCleanup) => {
      if (!gl.value || !scene.value || !camera.value) return

      const effectComposer = new EffectComposer(gl.value as WebGLRenderer)
      effectComposer.addPass(new RenderPass(scene.value, camera.value))
      effectComposer.addPass(new UnrealBloomPass(new THREE.Vector2(1024, 768), 1.5, 0.55, 0.9))

      if (lut.value) {
        effectComposer.addPass(new LUTPass({ lut: lut.value.texture3D, intensity: 1 }))
      }

      effectComposer.addPass(new OutputPass())
      effectComposer.setPixelRatio(gl.value.getPixelRatio())
      effectComposer.setSize(size.value.width || 1024, size.value.height || 768)
      composer.value = effectComposer

      onCleanup(() => {
        composer.value?.dispose()
        composer.value = null
      })
    })

    watch(
      () => [size.value.width, size.value.height] as const,
      ([width, height]) => {
        if (width > 0 && height > 0) composer.value?.setSize(width, height)
      },
    )

    useFrame((_, delta) => {
      composer.value?.render(delta)
    }, 1)

    return () => null
  },
})

export default defineComponent({
  setup() {
    return () =>
      h(
        Canvas,
        {
          gl: { antialias: false },
          camera: { position: [0, 2.5, 5], fov: 35 },
          onCreated: (state: { gl: THREE.WebGLRenderer }) => {
            state.gl.toneMapping = THREE.ACESFilmicToneMapping
            state.gl.toneMappingExposure = 1
          },
        },
        {
          default: () => [
            h('color', { attach: 'background', args: ['#151520'] }),
            h('ambientLight', { intensity: 0.35 }),
            h('spotLight', { position: [10, 10, 10], angle: 0.15, penumbra: 1, intensity: 18, decay: 2 }),
            h('pointLight', { position: [-10, -10, -10], intensity: 2.5, decay: 2 }),
            h('pointLight', { position: [0, 3.5, -4], intensity: 24, color: '#dfe7ff', decay: 2 }),
            h('pointLight', { position: [4, 1.5, 2], intensity: 8, color: '#ffb8de', decay: 2 }),
            h('pointLight', { position: [-4, 1, 2], intensity: 6, color: '#89bbff', decay: 2 }),
            h(StudioEnvironment),
            h(Model),
            h(Controls),
            h(PostProcessing),
          ],
          overlay: () =>
            h(
              'div',
              {
                style: {
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  maxWidth: '320px',
                  padding: '12px 14px',
                  background: 'rgba(14, 14, 19, 0.72)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: '#e8e8ef',
                  fontFamily: 'Inter var, sans-serif',
                  fontSize: '12px',
                  lineHeight: 1.45,
                  pointerEvents: 'auto',
                },
              },
              [
                h('div', { style: { fontWeight: 600, marginBottom: '6px' } }, 'GlassFlower'),
                h(
                  'div',
                  null,
                  'First-pass Vue port of the desktop demo. Assets are local; GLTF, HDRI, LUT, bloom, and controls are rebuilt with Three add-ons.',
                ),
              ],
            ),
        },
      )
  },
})
