from PIL import Image
import numpy as np
import os


def convert_premultiplied_to_straight(image_path):
    img = Image.open(image_path).convert("RGBA")
    data = np.array(img)
    rgb = data[:, :, :3]
    alpha = data[:, :, 3] / 255.0
    alpha[alpha == 0] = 1
    straight_rgb = rgb / alpha[:, :, np.newaxis]
    straight_rgb = np.clip(straight_rgb, 0, 255).astype(np.uint8)
    alpha = (data[:, :, 3]).astype(np.uint8)
    result = np.dstack((straight_rgb, alpha))
    result_image = Image.fromarray(result, "RGBA")
    result_image.save(image_path)


def apply_to_all_png_files(folder_path):
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".png"):
                file_path = os.path.join(root, file)
                convert_premultiplied_to_straight(file_path)
                print(f"Converted {file_path}")


apply_to_all_png_files("./convert")
