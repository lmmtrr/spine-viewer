import {
  handleFilterInput,
  resetAttachmentFlags,
  resetSkinFlags,
  setting,
} from "./events.js";
import { skeletons } from "./main.js";

export function createDirSelector(dirFiles) {
  const dirSelector = document.getElementById("dirSelector");
  Object.keys(dirFiles).forEach((dir) => {
    let optionElement = document.createElement("option");
    optionElement.value = dir;
    optionElement.textContent = dir;
    dirSelector.appendChild(optionElement);
  });
}

export function createSceneSelector(sceneIds) {
  let s = "";
  for (let v of sceneIds) {
    s += `<option>${v}</option>`;
  }
  document.getElementById("sceneSelector").innerHTML = s;
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
  resetAttachmentFlags(slots.length);
  const a = slots.map((value, index) => [value.attachment?.name, index]);
  a.sort(function (a, b) {
    const sa = String(a).replace(/(\d+)/g, (m) => m.padStart(3, "0"));
    const sb = String(b).replace(/(\d+)/g, (m) => m.padStart(3, "0"));
    return sa < sb ? -1 : sa > sb ? 1 : 0;
  });
  const f = a.filter((v) => v[0]);
  const attachment = document.getElementById("attachment");
  attachment.style.display = "block";
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
    attachment.appendChild(div);
  }
}

function createSkinUI() {
  const skins = skeletons["0"].skeleton.data.skins;
  if (skins.length === 1)
    document.getElementById("settingSelector").disabled = true;
  else {
    const skin = document.getElementById("skin");
    skin.style.display = "none";
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
      skin.appendChild(div);
    }
  }
}

export function resetUI() {
  document.getElementById("container").scrollTop = 0;
  document.getElementById("attachment").innerHTML = "";
  document.getElementById("skin").innerHTML = "";
  createAttachmentUI();
  createSkinUI();
  handleFilterInput();
}

export function switchUI() {
  const attachment = document.getElementById("attachment");
  const skin = document.getElementById("skin");
  switch (setting) {
    case "attachments":
      attachment.style.display = "block";
      skin.style.display = "none";
      const checkboxes = document
        .getElementById("attachment")
        .querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
      break;
    case "skins":
      attachment.style.display = "none";
      skin.style.display = "block";
      break;
  }
}
