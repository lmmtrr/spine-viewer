import {
  isFirstRender,
  restoreSkins,
  setFirstRenderFlag,
  setupEventListeners,
} from "./events.js";
import { sceneIds, folder, folders, isBinary, spineVersion } from "./setup.js";
import {
  moveX,
  moveY,
  moveStep,
  premultipliedAlpha,
  resetValues,
  rotate,
  scale,
  sceneIndex,
} from "./events.js";
import {
  createAnimationSelector,
  createSceneSelector,
  createFolderSelector,
  resetUI,
} from "./ui.js";

const canvas = document.getElementById("canvas");
let ctx;
let shader;
let batcher;
let skeletonRenderer;
let assetManager;
let mvp;
let lastFrameTime;
let requestId;
let folder2;
let fileName2;
const isSpineVersionAbove3 = Number(spineVersion.charAt(0)) > 3;
export let animationState;
export let skeletons = {};

const script = document.createElement("script");
script.src = `lib/spine-webgl-${spineVersion}.js`;
script.onload = () => {
  mvp = isSpineVersionAbove3 ? new spine.Matrix4() : new spine.webgl.Matrix4();
  setupEventListeners();
  createFolderSelector(folders);
  createSceneSelector(sceneIds);
  init();
};
document.body.appendChild(script);

function setAnimationAndSkin(skeleton) {
  const animationSelector = document.getElementById("animationSelector");
  switch (folder) {
    case "characters":
      animationState.setAnimation(0, "animation1", true);
      animationSelector.value = "animation1";
      skeleton.setSkinByName("face1");
      const checkboxes = container.querySelectorAll(
        "#skin input[type='checkbox']"
      );
      checkboxes[0].checked = true;
      break;
  }
}

export function init() {
  [folder2, fileName2] = sceneIds[sceneIndex].split(/\\(?!.*\\)/);
  if (!fileName2) {
    fileName2 = folder2;
    folder2 = "";
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (isSpineVersionAbove3) {
    ctx = new spine.ManagedWebGLRenderingContext(canvas);
    shader = spine.Shader.newTwoColoredTextured(ctx);
    batcher = new spine.PolygonBatcher(ctx);
    skeletonRenderer = new spine.SkeletonRenderer(ctx);
    assetManager = new spine.AssetManager(
      ctx.gl,
      `assets/${folder}/${folder2}/`
    );
  } else {
    ctx = new spine.webgl.ManagedWebGLRenderingContext(canvas);
    shader = spine.webgl.Shader.newTwoColoredTextured(ctx);
    batcher = new spine.webgl.PolygonBatcher(ctx);
    skeletonRenderer = new spine.webgl.SkeletonRenderer(ctx);
    assetManager = new spine.webgl.AssetManager(
      ctx.gl,
      `assets/${folder}/${folder2}/`
    );
  }
  loadFiles();
}

export function loadFiles() {
  if (isBinary) {
    assetManager.loadBinary(fileName2 + ".skel");
  } else {
    assetManager.loadText(fileName2 + ".json");
  }
  assetManager.loadTextureAtlas(fileName2 + ".atlas");
  requestAnimationFrame(load);
}

function load() {
  if (assetManager.isLoadingComplete()) {
    skeletons["0"] = loadSkeleton(premultipliedAlpha);
    lastFrameTime = Date.now() / 1000;
    requestAnimationFrame(render);
  } else requestAnimationFrame(load);
}

function calculateSetupPoseBounds(skeleton) {
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform();
  const offset = new spine.Vector2();
  const size = new spine.Vector2();
  skeleton.getBounds(offset, size, []);
  return { offset: offset, size: size };
}

function loadSkeleton(premultipliedAlpha) {
  const atlas = assetManager.get(fileName2 + ".atlas");
  const atlasLoader = new spine.AtlasAttachmentLoader(atlas);
  const skeletonLoader = isBinary
    ? new spine.SkeletonBinary(atlasLoader)
    : new spine.SkeletonJson(atlasLoader);
  const fileName = isBinary ? fileName2 + ".skel" : fileName2 + ".json";
  const skeletonData = skeletonLoader.readSkeletonData(
    assetManager.get(fileName)
  );
  const skeleton = new spine.Skeleton(skeletonData);
  const bounds = calculateSetupPoseBounds(skeleton);
  const animationStateData = new spine.AnimationStateData(skeleton.data);
  animationState = new spine.AnimationState(animationStateData);
  const animations = skeleton.data.animations;
  animationState.setAnimation(0, animations[0].name, true);
  createAnimationSelector(animations);
  // setAnimationAndSkin(skeleton);
  return {
    skeleton: skeleton,
    state: animationState,
    bounds: bounds,
    premultipliedAlpha: premultipliedAlpha,
  };
}

export function dispose() {
  if (requestId) window.cancelAnimationFrame(requestId);
  requestId = undefined;
  if (assetManager) assetManager.dispose();
  skeletons = {};
  resetValues();
}

function render() {
  const gl = ctx.gl;
  const now = Date.now() / 1000;
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  resize();
  gl.clear(gl.COLOR_BUFFER_BIT);
  const skeleton = skeletons["0"].skeleton;
  const state = skeletons["0"].state;
  const premultipliedAlpha = skeletons["0"].premultipliedAlpha;
  state.update(delta);
  state.apply(skeleton);
  skeleton.updateWorldTransform();
  shader.bind();
  if (isSpineVersionAbove3) {
    shader.setUniformi(spine.Shader.SAMPLER, 0);
    shader.setUniform4x4f(spine.Shader.MVP_MATRIX, mvp.values);
  } else {
    shader.setUniformi(spine.webgl.Shader.SAMPLER, 0);
    shader.setUniform4x4f(spine.webgl.Shader.MVP_MATRIX, mvp.values);
  }
  batcher.begin(shader);
  skeletonRenderer.vertexEffect = null;
  skeletonRenderer.premultipliedAlpha = premultipliedAlpha;
  skeletonRenderer.draw(batcher, skeleton);
  batcher.end();
  shader.unbind();
  if (isFirstRender) {
    resetUI();
    restoreSkins();
    setFirstRenderFlag(false);
  }
  requestId = requestAnimationFrame(render);
}

export function resize() {
  const bounds = skeletons["0"].bounds;
  const centerX = bounds.offset.x + bounds.size.x * 0.5;
  const centerY = bounds.offset.y + bounds.size.y * 0.5;
  const scaleX = bounds.size.x / canvas.width;
  const scaleY = bounds.size.y / canvas.height;
  let scale_ = Math.max(scaleX, scaleY);
  scale_ /= scale;
  const width = canvas.width * scale_;
  const height = canvas.height * scale_;
  mvp.ortho2d(centerX - width * 0.5, centerY - height * 0.5, width, height);
  const c = Math.cos(Math.PI * 0.002 * rotate);
  const s = Math.sin(Math.PI * 0.002 * rotate);
  const rotateMatrix = isSpineVersionAbove3
    ? new spine.Matrix4()
    : new spine.webgl.Matrix4();
  rotateMatrix.set([c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  mvp.multiply(rotateMatrix);
  mvp.translate(moveX * moveStep, -moveY * moveStep, 0);
  ctx.gl.viewport(0, 0, canvas.width, canvas.height);
}
