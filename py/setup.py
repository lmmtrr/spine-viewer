from collections import OrderedDict
from pathlib import Path
import json
import os
import re


def find_model_files(base_dir):
    result = {}
    base_path = Path(base_dir)
    for folder in (d for d in base_path.iterdir() if d.is_dir()):
        model_files = []
        for file in folder.rglob("*.atlas"):
            model_files.append(
                os.path.relpath(file, f"../assets/{folder}").replace(".atlas", "")
            )
        if model_files:
            result[folder.name] = model_files
    return result


isBinaries = {}
folders = find_model_files("../assets/")
folders = OrderedDict(sorted(folders.items(), key=lambda t: t[0]))
first_folder = next(iter(folders))
first_files = folders[first_folder]
p1 = f"../assets/{first_folder}/{first_files[0]}.skel"
p2 = f"../assets/{first_folder}/{first_files[0]}.json"
spine_version = ""
if os.path.exists(p1):
    with open(p1, "rb") as f:
        data = f.read()
        position = re.search(b"\.", data).start()
        spine_version = data[position - 1 : position + 2].decode()
elif os.path.exists(p2):
    with open(p2, "r", encoding="utf-8") as f:
        spine_version = json.load(f)["skeleton"]["spine"][:3]
for folder in folders.keys():
    p1 = f"../assets/{folder}/{folders[folder][0]}.skel"
    p2 = f"../assets/{folder}/{folders[folder][0]}.json"
    if os.path.exists(p1):
        isBinaries[folder] = True
    elif os.path.exists(p2):
        isBinaries[folder] = False

with open("../js/setup.js", "w", encoding="utf-8") as f:
    f.write(f'export const spineVersion = "{spine_version}";\n')
    f.write(f"export let isBinary = {str(isBinaries[first_folder]) .lower()};\n")
    f.write(f"export const isBinaries = {json.dumps(isBinaries)};\n")
    f.write(f'export let folder = "{first_folder}";\n')
    f.write(f"export const folders = {json.dumps(folders)};\n")
    f.write(f"export let sceneIds = {json.dumps(folders[first_folder])};\n")
    f.write(f"export function setBinaryflag(flag) {{\n")
    f.write(f"  isBinary = flag;\n")
    f.write(f"}}\n")
    f.write(f"export function setFolder(value) {{\n")
    f.write(f"  folder = value;\n")
    f.write(f"}}\n")
    f.write(f"export function setSceneIds(value) {{\n")
    f.write(f"  sceneIds = value;\n")
    f.write(f"}}\n")
