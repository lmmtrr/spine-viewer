import os
import re
from PIL import Image


def extract_file_sizes(atlas_file):
    file_sizes = []
    with open(atlas_file, "r", encoding="utf-8") as file:
        lines = file.readlines()
        i = 0
        while i < len(lines):
            if lines[i].endswith(".png\n"):
                filename = lines[i].strip()
                size_line = lines[i + 1]
                size_values = re.findall(r"\d+", size_line)
                width = int(size_values[0])
                height = int(size_values[1])
                file_sizes.append([filename, width, height])
                i += 2
            else:
                i += 1
    return file_sizes


def compare_and_resize_images_in_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".atlas"):
                atlas_file = os.path.join(root, file)
                file_sizes = extract_file_sizes(atlas_file)
                for filename, width, height in file_sizes:
                    img_path = os.path.join(root, filename)
                    if os.path.exists(img_path):
                        img = Image.open(img_path)
                        img_width, img_height = img.size
                        if img_width != width or img_height != height:
                            img = img.resize((width, height), Image.NEAREST)
                            img.save(img_path)
                            print(f"Resized {filename} to {width}x{height} in {root}")


assets_directory = "../assets"
for item in os.listdir(assets_directory):
    if os.path.isdir(os.path.join(assets_directory, item)):
        directory_path = os.path.join(assets_directory, item)
        compare_and_resize_images_in_directory(directory_path)
