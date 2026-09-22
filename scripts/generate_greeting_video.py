import cv2
import numpy as np
import os
import shutil

workspace = r"c:\Users\JIYA DARSHINI\Downloads\Portfolio"
assets_dir = os.path.join(workspace, "assets")
os.makedirs(assets_dir, exist_ok=True)

# Keyframes
f_start = os.path.join(assets_dir, "portrait_base.jpg")
f_mid = r"C:\Users\JIYA DARSHINI\.gemini\antigravity-ide\brain\e31cc154-eab8-48f7-ab05-e340750374f2\girl_greeting_raise_1790035759739.jpg"
f_wave = r"C:\Users\JIYA DARSHINI\.gemini\antigravity-ide\brain\e31cc154-eab8-48f7-ab05-e340750374f2\girl_greeting_wave_1790035737839.jpg"

# Save copies to assets
shutil.copy(f_mid, os.path.join(assets_dir, "keyframe_raise.jpg"))
shutil.copy(f_wave, os.path.join(assets_dir, "keyframe_wave.jpg"))

img_start = cv2.imread(f_start)
H, W = img_start.shape[:2]

img_mid = cv2.resize(cv2.imread(f_mid), (W, H), interpolation=cv2.INTER_CUBIC)
img_wave = cv2.resize(cv2.imread(f_wave), (W, H), interpolation=cv2.INTER_CUBIC)

print(f"Loaded keyframes at {W}x{H}")

# Smooth cosine easing
def ease_in_out(t):
    return (1.0 - np.cos(t * np.pi)) / 2.0

fps = 30
duration_total = 4.0
total_frames = int(fps * duration_total)

# Timing timeline (seconds):
# 0.0 - 0.5s: Hold start (15 frames)
# 0.5 - 1.2s: Transition start -> mid -> wave (21 frames)
# 1.2 - 2.0s: Small wave motion (wave <-> wave_tilt) (24 frames)
# 2.0 - 2.8s: Transition wave -> mid -> start (24 frames)
# 2.8 - 4.0s: Settle at start pose (36 frames)

out_video_path = os.path.join(assets_dir, "greeting_wave.mp4")
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
writer = cv2.VideoWriter(out_video_path, fourcc, fps, (W, H))

for i in range(total_frames):
    t_sec = i / fps
    
    if t_sec < 0.5:
        # Hold start
        frame = img_start.copy()
    elif t_sec < 1.2:
        # Raise hand (start -> mid -> wave)
        progress = (t_sec - 0.5) / 0.7
        eased = ease_in_out(progress)
        if eased < 0.5:
            sub_p = eased / 0.5
            frame = cv2.addWeighted(img_start, 1.0 - sub_p, img_mid, sub_p, 0)
        else:
            sub_p = (eased - 0.5) / 0.5
            frame = cv2.addWeighted(img_mid, 1.0 - sub_p, img_wave, sub_p, 0)
    elif t_sec < 2.0:
        # Gentle wave oscillation
        wave_prog = (t_sec - 1.2) / 0.8
        # subtle oscillation between wave and mid
        osc = np.sin(wave_prog * np.pi * 2) * 0.2
        w_wave = np.clip(1.0 - abs(osc), 0.7, 1.0)
        w_mid = 1.0 - w_wave
        frame = cv2.addWeighted(img_wave, w_wave, img_mid, w_mid, 0)
    elif t_sec < 2.8:
        # Lower hand (wave -> mid -> start)
        progress = (t_sec - 2.0) / 0.8
        eased = ease_in_out(progress)
        if eased < 0.5:
            sub_p = eased / 0.5
            frame = cv2.addWeighted(img_wave, 1.0 - sub_p, img_mid, sub_p, 0)
        else:
            sub_p = (eased - 0.5) / 0.5
            frame = cv2.addWeighted(img_mid, 1.0 - sub_p, img_start, sub_p, 0)
    else:
        # Hold end pose (ready for cursor eye interaction)
        frame = img_start.copy()
        
    writer.write(frame)

writer.release()
print(f"Generated {out_video_path} successfully ({total_frames} frames, {duration_total}s)!")
