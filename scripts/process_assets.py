import cv2
import numpy as np
import os
from PIL import Image

workspace = r"c:\Users\JIYA DARSHINI\Downloads\Portfolio"
assets_dir = os.path.join(workspace, "assets")
os.makedirs(assets_dir, exist_ok=True)

print("Processing high-fidelity assets...")

# 1. Base Portrait: Load Centre.jpeg
centre_bgr = cv2.imread(os.path.join(workspace, "Centre.jpeg"))
H, W = centre_bgr.shape[:2]
print(f"Base image dimensions: {W}x{H}")

# Peak video frames:
# Recall that in 1280x720 video frames:
# Peak indices: Up (188), down (239), left (40), right (196)
def extract_peak_frame(vid_name, frame_idx):
    cap = cv2.VideoCapture(os.path.join(workspace, f"{vid_name}.mp4"))
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    cap.release()
    if not ret:
        raise ValueError(f"Failed to read frame {frame_idx} from {vid_name}.mp4")
    return frame

peak_up_720 = extract_peak_frame("Up", 188)
peak_down_720 = extract_peak_frame("down", 239)
peak_left_720 = extract_peak_frame("left", 40)
peak_right_720 = extract_peak_frame("right", 196)

# Extract frame 0 from Up.mp4 as base center
cap = cv2.VideoCapture(os.path.join(workspace, "Up.mp4"))
cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
_, peak_center_720 = cap.read()
cap.release()

# Let's upscale the video frames to match Centre.jpeg (W x H) with bicubic / lanczos interpolation
peak_up = cv2.resize(peak_up_720, (W, H), interpolation=cv2.INTER_CUBIC)
peak_down = cv2.resize(peak_down_720, (W, H), interpolation=cv2.INTER_CUBIC)
peak_left = cv2.resize(peak_left_720, (W, H), interpolation=cv2.INTER_CUBIC)
peak_right = cv2.resize(peak_right_720, (W, H), interpolation=cv2.INTER_CUBIC)
peak_center = cv2.resize(peak_center_720, (W, H), interpolation=cv2.INTER_CUBIC)

# In 1280x720, eye region was: x1=780, y1=160, x2=980, y2=270
# In W x H (2752 x 1536):
scale_x = W / 1280.0
scale_y = H / 720.0
x1 = int(775 * scale_x)
y1 = int(155 * scale_y)
x2 = int(985 * scale_x)
y2 = int(275 * scale_y)
crop_w = x2 - x1
crop_h = y2 - y1

print(f"High-res Eye Bounding Box: x1={x1}, y1={y1}, w={crop_w}, h={crop_h}")
print(f"Relative coords: left={x1/W:.4f}, top={y1/H:.4f}, width={crop_w/W:.4f}, height={crop_h/H:.4f}")

# Create smooth feathered alpha mask
mask = np.zeros((crop_h, crop_w), dtype=np.float32)
# Draw double ellipse or soft rounded rectangle for both eyes
cv2.ellipse(mask, (crop_w//2, crop_h//2), (crop_w//2 - 15, crop_h//2 - 12), 0, 0, 360, 1.0, -1)
mask_blurred = cv2.GaussianBlur(mask, (41, 41), 14)
# Normalize mask
mask_blurred = np.clip(mask_blurred / mask_blurred.max(), 0.0, 1.0)

# Save eye directional states
eye_dict = {
    "center": peak_center,
    "up": peak_up,
    "down": peak_down,
    "left": peak_left,
    "right": peak_right
}

for name, full_img in eye_dict.items():
    crop = full_img[y1:y2, x1:x2]
    rgba = cv2.cvtColor(crop, cv2.COLOR_BGR2BGRA)
    rgba[:, :, 3] = (mask_blurred * 255).astype(np.uint8)
    out_path = os.path.join(assets_dir, f"eye_{name}.png")
    cv2.imwrite(out_path, rgba)
    print(f"Saved {out_path}")

# 2. Base Portrait Export
# Let's save the high-res base portrait as JPEG/WebP/PNG
# Also create a version with soft edge blending into #061A3A (RGB: 6, 26, 58)
cv2.imwrite(os.path.join(assets_dir, "portrait_base.jpg"), centre_bgr, [cv2.IMWRITE_JPEG_QUALITY, 95])

# Also create an optimized webp version
cv2.imwrite(os.path.join(assets_dir, "portrait_base.webp"), centre_bgr, [cv2.IMWRITE_WEBP_QUALITY, 95])

# Save coordinate metadata JSON for JS
import json
metadata = {
    "eyeBox": {
        "x": x1,
        "y": y1,
        "width": crop_w,
        "height": crop_h,
        "leftPercent": x1 / W,
        "topPercent": y1 / H,
        "widthPercent": crop_w / W,
        "heightPercent": crop_h / H
    },
    "imageDimensions": {
        "width": W,
        "height": H,
        "aspectRatio": W / H
    }
}

with open(os.path.join(assets_dir, "coordinates.json"), "w") as f:
    json.dump(metadata, f, indent=2)

print("Coordinate metadata saved to assets/coordinates.json")
print("Asset processing complete!")
