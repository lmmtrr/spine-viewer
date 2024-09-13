from collections import OrderedDict
from pathlib import Path
import json
import os
import re


def find_model_files(base_dir):
    dir_files = {}
    for dir in (d for d in Path(base_dir).iterdir() if d.is_dir()):
        model_files = []
        for atlas_file in dir.rglob("*.atlas"):
            skel_file = atlas_file.with_suffix(".skel")
            if skel_file.exists():
                model_files.append(os.path.relpath(skel_file, dir))
            json_file = atlas_file.with_suffix(".json")
            if json_file.exists():
                model_files.append(os.path.relpath(json_file, dir))
        if model_files:
            dir_files[dir.name] = model_files
    return dir_files


dir_files = find_model_files("../assets/")
dir_files = OrderedDict(sorted(dir_files.items(), key=lambda t: t[0]))
first_dir = next(iter(dir_files))
first_file = f"../assets/{first_dir}/{dir_files[first_dir][0]}"
ext = os.path.splitext(first_file)[1]
spine_version = ""
if ext == ".skel":
    with open(first_file, "rb") as f:
        data = f.read()
        position = re.search(b"\.", data).start()
        spine_version = data[position - 1 : position + 2].decode()
elif ext == ".json":
    with open(first_file, "r", encoding="utf-8") as f:
        spine_version = json.load(f)["skeleton"]["spine"][:3]


with open("../js/setup.js", "w", encoding="utf-8") as f:
    f.write(f'export const spineVersion = "{spine_version}";\n')
    f.write(f'export let dir = "{first_dir}";\n')
    f.write(f"export const dirFiles = {json.dumps(dir_files)};\n")
    f.write(f"export let sceneIds = {json.dumps(dir_files[first_dir])};\n")
    f.write(f"export function setDir(value) {{\n")
    f.write(f"  dir = value;\n")
    f.write(f"}}\n")
    f.write(f"export function setSceneIds(value) {{\n")
    f.write(f"  sceneIds = value;\n")
    f.write(f"}}\n")
