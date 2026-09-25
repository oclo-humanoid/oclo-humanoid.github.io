"""Re-encode the OCLO clips for the project website.

Usage (from the project root):
    python website/tools/encode_videos.py            # encode everything
    python website/tools/encode_videos.py --sheets DIR   # also write anonymity contact sheets
    python website/tools/encode_videos.py --only teleop_1,teleop_2   # re-encode just these

Every output is H.264 (yuv420p, high profile), no audio, metadata stripped,
+faststart, 30 fps, max 1280 px wide (square clips 720x720), with a JPG poster.
Requires: pip install imageio-ffmpeg
"""
import argparse
import os
import re
import subprocess
import sys

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SRC = os.path.join(ROOT, "videos")
OUT = os.path.join(ROOT, "website", "static", "videos")
POST = os.path.join(ROOT, "website", "static", "images", "posters")

# (source relative to videos/, output name, max width, crf)
CLIPS = [
    ("training_stages/Stage1_1080x1080.mp4", "stage1", 720, 30),
    ("training_stages/Stage2_1080x1080.mp4", "stage2", 720, 30),
    ("training_stages/Stage3_1080x1080.mp4", "stage3", 720, 30),
    ("deployment/oclo (prior).mp4", "deploy_prior", 1280, 28),
    ("deployment/oclo (prior, cem).mp4", "deploy_prior_cem", 1280, 28),
    ("deployment/oclo (prior, cem) with candidates.mp4", "deploy_prior_cem_candidates", 1280, 28),
    ("robustness/cropped/pull_succ_cut_crop.mp4", "pull_succ", 1280, 28),
    ("robustness/cropped/pull_fail_cut_crop.mp4", "pull_fail", 1280, 28),
    ("robustness/cropped/push_succ_cut_crop.mp4", "push_succ", 1280, 28),
    ("robustness/cropped/push_fail_cut_crop.mp4", "push_fail", 1280, 28),
    ("robustness/cropped/lateral_succ_cut_crop.mp4", "lateral_succ", 1280, 28),
    ("robustness/cropped/lateral_fail_cut_crop.mp4", "lateral_fail", 1280, 28),
    ("tasks/escalator_motion_cut_1x.mp4", "task_escalator", 960, 29),
    ("tasks/curtain_open_succ_cut_2x.mp4", "task_curtain", 960, 29),
    ("tasks/blur/table_wipe_succ_cut_blur.mp4", "task_table_wipe", 960, 29),
    ("tasks/blur/chair_push_succ_cut_blur.mp4", "task_chair_push", 960, 29),
    ("tasks/cart_pull_succ_cut_2x.mp4", "task_cart_pull", 960, 29),
    ("tasks/draw_wipe_succ_cut_3x.mp4", "task_draw_wipe", 960, 29),
    ("tasks/box_pick_rotate_place_succ_cut_3x.mp4", "task_box", 960, 29),
    ("tasks/doll_picking_succ_cut_2x.mp4", "task_doll", 960, 29),
    ("tasks/insert_succ_cut_3x.mp4", "task_insert", 960, 29),
    ("teleoperation/cropped/teleop_1_cropped.mp4", "teleop_1", 720, 28),
    ("teleoperation/cropped/teleop_2_cropped.mp4", "teleop_2", 720, 28),
    ("teleoperation/cropped/teleop_3_cropped.mp4", "teleop_3", 720, 28),
]
FULL_VIDEO = (os.path.join(ROOT, "ICRA27_8660_V.mp4"), "oclo_video", 1280, 27)

# hero montage: (output name of an encoded task clip, start time in seconds, max seconds).
# Each piece runs from its start time for up to max seconds, and stops early if the clip ends.
# Start times chosen by the author (2026-09-25) to show the main part of each task.
MONTAGE = [
    ("task_box",        3.14, 2.2),
    ("task_cart_pull",  6.00, 2.2),
    ("task_table_wipe", 7.00, 2.2),
    ("task_doll",       2.07, 3.2),
    ("task_chair_push", 6.00, 2.2),
    ("task_curtain",    5.65, 2.2),
    ("task_draw_wipe",  7.50, 2.2),
    ("task_escalator",  0.50, 2.2),
    ("task_insert",     8.00, 2.2),
]

ENC = ["-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p",
       "-an", "-map_metadata", "-1", "-map_chapters", "-1", "-movflags", "+faststart",
       "-metadata", "title=", "-metadata", "comment=", "-metadata", "encoder="]


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-2000:])
        raise SystemExit(f"ffmpeg failed: {' '.join(cmd[:6])} ...")


def duration(path):
    r = subprocess.run([FF, "-hide_banner", "-i", path], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + float(m.group(3))


def scale_filter(max_w):
    # fit within max_w wide (never upscale), even dimensions, 30 fps
    return f"fps=30,scale='min({max_w},iw)':-2:flags=lanczos,setsar=1"


def encode(src, name, max_w, crf):
    dst = os.path.join(OUT, name + ".mp4")
    run([FF, "-y", "-hide_banner", "-i", src, "-vf", scale_filter(max_w), "-crf", str(crf),
         "-g", "60", *ENC, dst])
    poster = os.path.join(POST, name + ".jpg")
    t = min(0.4, duration(dst) / 4)
    run([FF, "-y", "-hide_banner", "-ss", f"{t:.2f}", "-i", dst, "-frames:v", "1",
         "-q:v", "4", "-map_metadata", "-1", poster])
    return dst


def montage():
    parts, labels = [], []
    inputs = []
    for i, (name, start, max_secs) in enumerate(MONTAGE):
        p = os.path.join(OUT, name + ".mp4")
        # stop one frame short of the end so the last frame decodes cleanly
        secs = min(max_secs, duration(p) - start - 1 / 30)
        if secs <= 0:
            raise SystemExit(f"montage start {start}s is past the end of {name}")
        print(f"  montage piece {name:16s} {start:5.2f}-{start + secs:5.2f}s ({secs:.2f}s)")
        inputs += ["-ss", f"{start:.2f}", "-t", f"{secs:.2f}", "-i", p]
        parts.append(f"[{i}:v]fps=30,scale=960:540:force_original_aspect_ratio=decrease,"
                     f"pad=960:540:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1[v{i}]")
        labels.append(f"[v{i}]")
    fc = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(MONTAGE)}:v=1:a=0[out]"
    dst = os.path.join(OUT, "hero_montage.mp4")
    run([FF, "-y", "-hide_banner", *inputs, "-filter_complex", fc, "-map", "[out]",
         "-crf", "29", "-g", "60", *ENC, dst])
    run([FF, "-y", "-hide_banner", "-ss", "0.3", "-i", dst, "-frames:v", "1", "-q:v", "4",
         "-map_metadata", "-1", os.path.join(POST, "hero_montage.jpg")])


def contact_sheets(sheet_dir):
    os.makedirs(sheet_dir, exist_ok=True)
    for src_rel, name, _, _ in CLIPS:
        src = os.path.join(SRC, src_rel)
        d = duration(src)
        run([FF, "-y", "-hide_banner", "-i", src, "-vf",
             f"fps=8/{d:.2f},scale=360:-2,tile=8x1:padding=4:color=white",
             "-frames:v", "1", "-q:v", "5", os.path.join(sheet_dir, name + ".jpg")])
    d = duration(FULL_VIDEO[0])
    run([FF, "-y", "-hide_banner", "-i", FULL_VIDEO[0], "-vf",
         f"fps=32/{d:.2f},scale=360:-2,tile=8x4:padding=4:color=white",
         "-frames:v", "1", "-q:v", "5", os.path.join(sheet_dir, "oclo_video.jpg")])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheets", metavar="DIR", help="also write contact sheets to DIR")
    ap.add_argument("--montage-only", action="store_true", help="rebuild only the hero montage")
    ap.add_argument("--only", metavar="NAMES", help="comma-separated output names to re-encode, e.g. teleop_1,teleop_2")
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(POST, exist_ok=True)
    if args.montage_only:
        montage()
        print("hero_montage", round(os.path.getsize(os.path.join(OUT, "hero_montage.mp4")) / 1e6, 2), "MB")
        return
    if args.only:
        wanted = set(args.only.split(","))
        unknown = wanted - {c[1] for c in CLIPS}
        if unknown:
            raise SystemExit(f"unknown clip names: {sorted(unknown)}")
        for src_rel, name, w, crf in CLIPS:
            if name in wanted:
                dst = encode(os.path.join(SRC, src_rel), name, w, crf)
                print(f"{name:32s} {os.path.getsize(dst)/1e6:6.2f} MB")
        return
    for src_rel, name, w, crf in CLIPS:
        dst = encode(os.path.join(SRC, src_rel), name, w, crf)
        print(f"{name:32s} {os.path.getsize(dst)/1e6:6.2f} MB")
    dst = encode(*FULL_VIDEO)
    print(f"{FULL_VIDEO[1]:32s} {os.path.getsize(dst)/1e6:6.2f} MB")
    montage()
    print(f"{'hero_montage':32s} {os.path.getsize(os.path.join(OUT, 'hero_montage.mp4'))/1e6:6.2f} MB")
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f"TOTAL videos: {total/1e6:.1f} MB")
    if args.sheets:
        contact_sheets(args.sheets)
        print("contact sheets ->", args.sheets)


if __name__ == "__main__":
    main()
