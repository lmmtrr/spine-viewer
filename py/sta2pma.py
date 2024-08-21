from PIL import Image
import numpy as np
import os


def convert_straight_to_premultiplied(image_path):
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)
    rgb = data[:, :, :3]
    alpha = data[:, :, 3] / 255.0
    premultiplied_rgb = rgb * alpha[:, :, np.newaxis]
    premultiplied_rgb = np.clip(premultiplied_rgb, 0, 255).astype(np.uint8)
    result = np.dstack((premultiplied_rgb, data[:, :, 3]))
    result_image = Image.fromarray(result, "RGBA")
    result_image.save(image_path)


def apply_to_all_png_files(folder_path):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".png"):
                file_path = os.path.join(root, file)
                convert_straight_to_premultiplied(file_path)
                print(f"Converted {file_path}")


apply_to_all_png_files("../assets")
