import cv2

workspace = r"c:\Users\JIYA DARSHINI\Downloads\Portfolio"

for name in ["Up", "down", "left", "right"]:
    cap = cv2.VideoCapture(f"{workspace}/{name}.mp4")
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    dur = total / fps if fps > 0 else 0
    print(f"{name}.mp4: {w}x{h}, {total} frames, {fps:.1f} fps, duration={dur:.2f}s")
    cap.release()
