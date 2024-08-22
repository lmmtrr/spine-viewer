import { animationState, dispose, init, loadFiles, skeletons } from "./main.js";
import {
  charaIds,
  folder,
  folders,
  isBinaries,
  setBinaryflag,
  setCharaIds,
  setFolder,
} from "./setup.js";
import { createCharacterSelector, switchUI, resetUI } from "./ui.js";

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
export let charaIndex = 0;
let startX = 0;
let startY = 0;
let mouseDown = false;
let isMove = false;
export let isFirstRender = true;
export let premultipliedAlpha = false;
let swap = [];
export let custom = "attachments";

const canvas = document.getElementById("canvas");
const toggleButton = document.getElementById("toggleButton");
const pmaCheckbox = document.getElementById("pmaCheckbox");
const folderSelector = document.getElementById("folderSelector");
const characterSelector = document.getElementById("characterSelector");
const animationSelector = document.getElementById("animationSelector");
const customSelector = document.getElementById("customSelector");
const filterBox = document.getElementById("filterBox");
const container = document.getElementById("container");

export function resetSwap(length) {
  swap = Array(length).fill(null);
}

export function setFirstRenderFlag(flag) {
  isFirstRender = flag;
}

export function resetValues() {
  scale = scaleInit;
  moveX = 0;
  moveY = 0;
  isFirstRender = true;
  custom = "attachments";
  customSelector.value = "attachments";
  customSelector.disabled = false;
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
  characterSelector.addEventListener("change", handleCharacterChange);
  animationSelector.addEventListener("change", handleAnimationChange);
  customSelector.addEventListener("change", handleCustomChange);
  filterBox.addEventListener("input", handleFilterInput);
  container.addEventListener("input", handleCheckboxChange);
}

function handleKeyboardInput(e) {
  switch (e.key) {
    case "z":
    case "x":
      e.preventDefault();
      changeCharacter(e.key === "z" ? -1 : 1);
      break;
  }
}

function changeCharacter(delta) {
  charaIndex = (charaIndex + delta + charaIds.length) % charaIds.length;
  characterSelector.selectedIndex = charaIndex;
  dispose();
  loadFiles();
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
  setCharaIds(folders[folder]);
  setBinaryflag(isBinaries[folder]);
  charaIndex = 0;
  dispose();
  createCharacterSelector(charaIds);
  init();
}

function handleCharacterChange(e) {
  charaIndex = e.target.selectedIndex;
  dispose();
  init();
}

function restoreAttachments() {
  swap.forEach((attachment, i) => {
    if (attachment) {
      [skeletons["0"].skeleton.slots[i].attachment, swap[i]] = [
        swap[i],
        skeletons["0"].skeleton.slots[i].attachment,
      ];
    }
  });
}

function handleAnimationChange(e) {
  const animationName =
    skeletons["0"].skeleton.data.animations[e.target.selectedIndex].name;
  animationState.setAnimation(0, animationName, true);
  restoreAttachments();
  resetUI();
}

function handleCustomChange(e) {
  custom = e.target.value;
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
  [skeletons["0"].skeleton.slots[i].attachment, swap[i]] = [
    swap[i],
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
  switch (custom) {
    case "attachments":
      handleAttachmentCheckboxChange(e);
      break;
    case "skins":
      handleSkinCheckboxChange();
      break;
  }
}
