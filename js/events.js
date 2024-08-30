import { startRecording } from "./export.js";
import { animationState, dispose, init, loadFiles, skeletons } from "./main.js";
import {
  sceneIds,
  folder,
  folders,
  isBinaries,
  setBinaryflag,
  setSceneIds,
  setFolder,
} from "./setup.js";
import { createSceneSelector, switchUI } from "./ui.js";

const scaleInit = 1;
const scaleMax = 8;
const scaleMin = 1;
const scaleStep = 0.2;
const rotateStep = 0.3;
export const moveStep = 0.0013;
export let scale = scaleInit;
export let moveX = 0;
export let moveY = 0;
export let rotate = 0;
export let sceneIndex = 0;
let startX = 0;
let startY = 0;
let mouseDown = false;
let isMove = false;
let isRecording = false;
export let isFirstRender = true;
export let premultipliedAlpha = false;
let skinFlags = [];
let attachmentFlags = [];
export let setting = "attachments";

const canvas = document.getElementById("canvas");
const toggleButton = document.getElementById("toggleButton");
const pmaCheckbox = document.getElementById("pmaCheckbox");
const folderSelector = document.getElementById("folderSelector");
export const sceneSelector = document.getElementById("sceneSelector");
export const animationSelector = document.getElementById("animationSelector");
const settingSelector = document.getElementById("settingSelector");
const filterBox = document.getElementById("filterBox");
const container = document.getElementById("container");

export function setRecordingFlag(flag) {
  isRecording = flag;
}

export function setFirstRenderFlag(flag) {
  isFirstRender = flag;
}

export function resetValues() {
  scale = scaleInit;
  moveX = 0;
  moveY = 0;
  rotate = 0;
  isFirstRender = true;
  setting = "attachments";
  settingSelector.value = "attachments";
  settingSelector.disabled = false;
  filterBox.value = "";
}

export function setupEventListeners() {
  document.onkeydown = handleKeyboardInput;
  window.addEventListener("resize", handleResize);
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseout", handleMouseOut);
  canvas.addEventListener("wheel", handleWheel);
  toggleButton.addEventListener("click", toggleSidebar);
  pmaCheckbox.addEventListener("change", handlePMACheckboxChange);
  folderSelector.addEventListener("change", handleFolderChange);
  sceneSelector.addEventListener("change", handleSceneChange);
  animationSelector.addEventListener("change", handleAnimationChange);
  settingSelector.addEventListener("change", handlesettingChange);
  filterBox.addEventListener("input", handleFilterInput);
  container.addEventListener("input", handleCheckboxChange);
}

function nextScene() {
  sceneSelector.focus();
  sceneIndex = (sceneSelector.selectedIndex + 1) % sceneSelector.options.length;
  sceneSelector.selectedIndex = sceneIndex;
  handleSceneChange_();
}

function nextAnimation() {
  animationSelector.focus();
  let animationIndex =
    (animationSelector.selectedIndex + 1) % animationSelector.options.length;
  animationSelector.selectedIndex = animationIndex;
  handleAnimationChange_(animationIndex);
}

function export_() {
  if (isRecording) return;
  isRecording = true;
  animationState.setAnimation(0, animationSelector.value, true);
  startRecording();
}

function handleKeyboardInput(e) {
  if (!e.ctrlKey) return;
  switch (e.key) {
    case "s":
      e.preventDefault();
      nextScene();
      break;
    case "a":
      e.preventDefault();
      nextAnimation();
      break;
    case "e":
      e.preventDefault();
      export_();
      break;
  }
}

function handleResize() {
  const { innerWidth: w, innerHeight: h } = window;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
}

function handleMouseDown(e) {
  if (e.button === 2) return;
  startX = e.clientX;
  startY = e.clientY;
  mouseDown = true;
  isMove = e.clientX < canvas.width - 250 && e.clientX > 250;
}

function updateCursorStyle(e) {
  document.body.style.cursor = "default";
  if (e.clientX >= canvas.width - 250)
    document.body.style.cursor = `url("../cursors/rotate_right.svg"), auto`;
  else if (e.clientX <= 250)
    document.body.style.cursor = `url("../cursors/rotate_left.svg"), auto`;
}

function handleMouseMove(e) {
  updateCursorStyle(e);
  if (!mouseDown) return;
  if (isMove) {
    moveX += e.clientX - startX;
    moveY += e.clientY - startY;
  } else {
    rotate +=
      (e.clientY - startY) *
      rotateStep *
      (e.clientX >= canvas.width - 250 ? 1 : -1);
  }
  startX = e.clientX;
  startY = e.clientY;
}

function handleMouseUp() {
  mouseDown = false;
  isMove = false;
}

function handleMouseOut() {
  handleMouseUp();
}

function handleWheel(e) {
  e.preventDefault();
  scale = Math.min(
    scaleMax,
    Math.max(scaleMin, scale - Math.sign(e.deltaY) * scaleStep)
  );
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("close");
}

function handlePMACheckboxChange() {
  premultipliedAlpha = pmaCheckbox.checked;
  dispose();
  loadFiles();
}

function handleFolderChange(e) {
  setFolder(e.target.value);
  setSceneIds(folders[folder]);
  setBinaryflag(isBinaries[folder]);
  sceneIndex = 0;
  dispose();
  createSceneSelector(sceneIds);
  init();
}

function handleSceneChange_() {
  dispose();
  init();
}

function handleSceneChange(e) {
  sceneIndex = e.target.selectedIndex;
  handleSceneChange_();
}

function handleAnimationChange_(index) {
  const checkboxes = container.querySelectorAll("#skin input[type='checkbox']");
  skinFlags = Array.from(checkboxes).map((checkbox) => checkbox.checked);
  const animationName = skeletons["0"].skeleton.data.animations[index].name;
  animationState.setAnimation(0, animationName, true);
  restoreAttachments();
  setting = "attachments";
  settingSelector.value = "attachments";
  settingSelector.disabled = false;
  isFirstRender = true;
}

function handleAnimationChange(e) {
  handleAnimationChange_(e.target.selectedIndex);
}

export function resetAttachmentFlags(length) {
  attachmentFlags = Array(length).fill(null);
}

export function resetSkinFlags() {
  skinFlags = [];
}

function restoreAttachments() {
  attachmentFlags.forEach((attachment, index) => {
    if (attachment) {
      [
        skeletons["0"].skeleton.slots[index].attachment,
        attachmentFlags[index],
      ] = [
        attachmentFlags[index],
        skeletons["0"].skeleton.slots[index].attachment,
      ];
    }
  });
}

export function restoreSkins() {
  const checkboxes = document.querySelectorAll('#skin input[type="checkbox"]');
  checkboxes.forEach((checkbox, index) => {
    checkbox.checked = skinFlags[index];
  });
}

function handlesettingChange(e) {
  setting = e.target.value;
  restoreAttachments();
  switchUI();
}

function handleFilterInput(e) {
  const filterValue = e.target.value.toLowerCase();
  container.querySelectorAll(".item").forEach((item) => {
    const title = item
      .querySelector("label")
      .getAttribute("title")
      .toLowerCase();
    item.style.display =
      title.includes(filterValue) || filterValue === "" ? "flex" : "none";
  });
}

function handleAttachmentCheckboxChange(e) {
  const i = Number(e.target.getAttribute("data-old-index"));
  [skeletons["0"].skeleton.slots[i].attachment, attachmentFlags[i]] = [
    attachmentFlags[i],
    skeletons["0"].skeleton.slots[i].attachment,
  ];
}

function handleSkinCheckboxChange() {
  const skeleton = skeletons["0"].skeleton;
  const newSkin = new spine.Skin("_");
  const checkboxes = container.querySelectorAll("#skin input[type='checkbox']");
  skeleton.setSkin(null);
  checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
      newSkin.addSkin(
        skeleton.data.findSkin(checkbox.parentElement.textContent)
      );
    }
  });
  skeleton.setSkin(newSkin);
  skeleton.setToSetupPose();
}

function handleCheckboxChange(e) {
  if (e.target.type !== "checkbox") return;
  switch (setting) {
    case "attachments":
      handleAttachmentCheckboxChange(e);
      break;
    case "skins":
      handleSkinCheckboxChange();
      break;
  }
}
