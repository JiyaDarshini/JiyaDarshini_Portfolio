import cv2
import numpy as np
import json

workspace = r"c:\Users\JIYA DARSHINI\Downloads\Portfolio"
with open(f"{workspace}/assets/coordinates.json") as f:
    meta = json.load(f)

box = meta["eyeBox"]
x, y, w, h = box["x"], box["y"], box["width"], box["height"]

base = cv2.imread(f"{workspace}/assets/portrait_base.jpg")

for eye_name in ["up", "down", "left", "right", "center"]:
    eye_rgba = cv2.imread(f"{workspace}/assets/eye_{eye_name}.png", cv2.IMREAD_UNCHANGED)
    eye_rgb = eye_rgba[:, :, :3]
    alpha = (eye_rgba[:, :, 3] / 255.0)[:, :, np.newaxis]
    
    comp = base.copy()
    comp[y:y+h, x:x+w] = (eye_rgb * alpha + comp[y:y+h, x:x+w] * (1 - alpha)).astype(np.uint8)
    cv2.imwrite(f"{workspace}/assets/test_composite_{eye_name}.jpg", comp)
    print(f"Verified composite for {eye_name}")
