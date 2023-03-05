import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const labels = [
  '0000',
  '0001',
  '0010',
  '0011',
  '0100',
  '0101',
  '0110',
  '0111',
  '1000',
  '1001',
  '1010',
  '1011',
  '1100',
  '1101',
  '1110',
  '1111',
]

const lineColor1 = 0xbfdb38
const lineColor2 = 0xe7b10a
const MaterialColor = 0x9dc08b

const options = {
  autoRotate: true,
  rotation: { xa: Math.PI / 2, ya: 0, za: 0 },
}

const coords = labels.map(function (label) {
  return label.split('').map(function (num) {
    return parseInt(num) - 0.5
  })
})

function rotateXW(angle) {
  const mat = new THREE.Matrix4()
  mat.set(
    Math.cos(angle),
    0,
    0,
    -Math.sin(angle),
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    Math.sin(angle),
    0,
    0,
    Math.cos(angle)
  )
  return mat
}

function rotateYW(angle) {
  const mat = new THREE.Matrix4()
  mat.set(
    1,
    0,
    0,
    0,
    0,
    Math.cos(angle),
    0,
    Math.sin(angle),
    0,
    0,
    1,
    0,
    0,
    -Math.sin(angle),
    0,
    Math.cos(angle)
  )
  return mat
}

function rotateZW(angle) {
  const mat = new THREE.Matrix4()
  mat.set(
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    Math.cos(angle),
    -Math.sin(angle),
    0,
    0,
    Math.sin(angle),
    Math.cos(angle)
  )
  return mat
}

function project(w) {
  const lw = 1.5
  const mat = new THREE.Matrix4()
  mat.set(
    1 / (lw - w),
    0,
    0,
    0,
    0,
    1 / (lw - w),
    0,
    0,
    0,
    0,
    1 / (lw - w),
    0,
    0,
    0,
    0,
    0
  )
  return mat
}

function rotateAndProject(rot) {
  return coords.map(function (coord) {
    const vec = new THREE.Vector4().fromArray(coord)
    return vec
      .applyMatrix4(rotateXW(rot.xa))
      .applyMatrix4(rotateYW(rot.ya))
      .applyMatrix4(rotateZW(rot.za))
      .applyMatrix4(project(vec.w))
  })
}

function hammingDistance(x, y) {
  let distance = 0

  for (let i = x ^ y; i > 0; i = i >> 1) {
    if (i & 1) {
      distance += 1
    }
  }
  return distance
}

function findEdges(numVertices) {
  const edges = []
  for (let i = 0; i < numVertices; i++) {
    for (let j = 0; j < numVertices; j++) {
      if (j <= i) continue
      const h = hammingDistance(i, j)
      if (h == 1) {
        edges.push([i, j])
      }
    }
  }
  return edges
}

function lineMaterialMaker(color) {
  return new THREE.LineBasicMaterial({
    color: color,
    linewidth: 2,
    opacity: 0.5,
    transparent: true,
  })
}

function chooseMaterial(edgePair, materialList) {
  return edgePair[0] & 4 ? materialList[1] : materialList[0]
}

function getAngle(t) {
  const rad = Math.PI / 180
  if (options.autoRotate) {
    return { xa: (t / 20) * rad, ya: (t / 20) * rad, za: (t / 20) * rad }
  }
  return options.rotation
}

function resizeRenderer(renderer) {
  const canvas = renderer.domElement
  const pixelRatio = window.devicePixelRatio
  const width = (canvas.clientWidth * pixelRatio) | 0
  const height = (canvas.clientHeight * pixelRatio) | 0
  const needsResize = canvas.width !== width || canvas.height !== height
  if (needsResize) {
    renderer.setSize(width, height, false)
  }
  return needsResize
}

const edges = findEdges(16)

let canvas, composer, renderer, fov, aspect, near, far, camera, scene, materials
let then = 0
let cube, cubeGeometry, cubeMaterial

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  canvas = renderer.domElement
  document.getElementById('interstellar').appendChild(canvas)

  const pixelRatio = window.devicePixelRatio
  const width = (canvas.clientWidth * pixelRatio) | 0
  const height = (canvas.clientHeight * pixelRatio) | 0

  fov = 60
  aspect = 2
  near = 1
  far = 1000
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
  camera.position.set(1.2, 1.4, 2)
  camera.lookAt(0, 0, 0)

  const controls = new OrbitControls(camera, canvas)
  controls.enableZoom = false
  controls.target.set(0, 0, 0)
  controls.update()

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  materials = [lineMaterialMaker(lineColor1), lineMaterialMaker(lineColor2)]
  for (let i = 0; i < edges.length; i++) {
    const edge = new THREE.Line(
      new THREE.Geometry(),
      chooseMaterial(edges[i], materials)
    )
    edge.name = 'edge_' + i
    scene.add(edge)
  }

  cubeMaterial = new THREE.MeshBasicMaterial({
    color: MaterialColor,
    opacity: 0.25,
    transparent: true,
  })

  cubeGeometry = new THREE.Geometry()
  for (var i = 0; i < 8; i++) {
    cubeGeometry.vertices.push(new THREE.Vector3(0, 0, 0))
  }

  cubeGeometry.faces.push(
    new THREE.Face3(0, 3, 2),
    new THREE.Face3(0, 1, 3),
    new THREE.Face3(1, 7, 3),
    new THREE.Face3(1, 5, 7),
    new THREE.Face3(5, 6, 7),
    new THREE.Face3(5, 4, 6),
    new THREE.Face3(4, 2, 6),
    new THREE.Face3(4, 0, 2),
    new THREE.Face3(2, 7, 6),
    new THREE.Face3(2, 3, 7),
    new THREE.Face3(4, 1, 0),
    new THREE.Face3(4, 5, 1)
  )
  cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
  scene.add(cube)

  composer = new EffectComposer(renderer)
  const renderPass = new RenderPass(scene, camera)

  composer.addPass(renderPass)

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.5,
    0.4,
    0.85
  )
  bloomPass.threshold = 0.04
  bloomPass.strength = 1.55
  bloomPass.radius = 0.02
  bloomPass.renderToScreen = true
  composer.addPass(bloomPass)
}

function animate() {
  requestAnimationFrame(animate)
  render()
}

function render() {
  const t = Date.now()
  const now = t * 0.001
  const deltaTime = (now - then) * 0.001
  then = now

  if (resizeRenderer(renderer)) {
    const canvas = composer.renderer.domElement
    camera.aspect = canvas.clientWidth / canvas.clientHeight
    camera.updateProjectionMatrix()
    composer.setSize(canvas.width, canvas.height)
  }

  const rot = getAngle(t)
  const projected = rotateAndProject(rot)

  for (let i = 0; i < edges.length; i++) {
    const edge = scene.getObjectByName('edge_' + i)
    edge.geometry.vertices = [projected[edges[i][0]], projected[edges[i][1]]]
    edge.geometry.verticesNeedUpdate = true
  }
  cube.geometry.vertices = projected.slice(0, 8)
  cube.geometry.verticesNeedUpdate = true
  cube.geometry.elementsNeedUpdate = true

  composer.render(deltaTime)
}

init()
animate()
