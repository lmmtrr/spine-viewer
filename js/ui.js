import { custom, resetValues, resetSwap } from "./events.js";
import { skeletons } from "./main.js";

export function createFolderSelector(folders) {
  const folderSelector = document.getElementById("folderSelector");
  Object.keys(folders).forEach((folder) => {
    let optionElement = document.createElement("option");
    optionElement.value = folder;
    optionElement.textContent = folder;
    folderSelector.appendChild(optionElement);
  });
}

export function createCharacterSelector(charaIds) {
  let s = "";
  for (let v of charaIds) {
    s += `<option>${v}</option>`;
  }
  document.getElementById("characterSelector").innerHTML = s;
}

export function createAnimationSelector(animations) {
  let s = "";
  for (let i = 0; i < animations.length; i++) {
    s += `<option>${animations[i].name}</option>`;
  }
  document.getElementById("animationSelector").innerHTML = s;
}

function createAttachmentUI() {
  const slots = skeletons["0"].skeleton.slots;
  resetSwap(slots.length);
  const a = slots.map((value, index) => [value.attachment?.name, index]);
  a.sort(function (a, b) {
    const sa = String(a).replace(/(\d+)/g, (m) => m.padStart(3, "0"));
    const sb = String(b).replace(/(\d+)/g, (m) => m.padStart(3, "0"));
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
  const f = a.filter((v) => v[0]);
  const attachments = document.getElementById("attachments");
  attachments.style.display = "block";
  for (let i = 0; i < f.length; i++) {
    const div = document.createElement("div");
    div.className = "item";
    const label = document.createElement("label");
    label.title = f[i][0];
    label.textContent = f[i][0];
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = "checked";
    input.dataset.oldIndex = String(f[i][1]);
    label.appendChild(input);
    div.appendChild(label);
    attachments.appendChild(div);
  }
}

function createSkinUI() {
  const skins = skeletons["0"].skeleton.data.skins;
  if (skins.length === 1)
    document.getElementById("customSelector").disabled = true;
  else {
    const skins = document.getElementById("skins");
    skins.style.display = "none";
    for (let i = 1; i < skins.length; i++) {
      const div = document.createElement("div");
      div.className = "item";
      const label = document.createElement("label");
      label.title = skins[i].name;
      label.textContent = skins[i].name;
      const input = document.createElement("input");
      input.type = "checkbox";
      if (i === 0) input.checked = "checked";
      label.appendChild(input);
      div.appendChild(label);
      skins.appendChild(div);
    }
  }
}

export function resetUI() {
  resetValues();
  document.getElementById("container").scrollTop = 0;
  document.getElementById("attachments").innerHTML = "";
  document.getElementById("skins").innerHTML = "";
  createAttachmentUI();
  createSkinUI();
}

export function switchUI() {
  const attachments = document.getElementById("attachments");
  const skins = document.getElementById("skins");
  switch (custom) {
    case "attachments":
      attachments.style.display = "block";
      skins.style.display = "none";
      const checkboxes = document
        .getElementById("attachment")
        .querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
      break;
    case "skins":
      attachments.style.display = "none";
      skins.style.display = "block";
      break;
  }
}
