import json
import os
import subprocess
import tempfile
import textwrap
from pathlib import Path

import imageio_ffmpeg
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image, ImageDraw, ImageFont

app = FastAPI(title="FlowChera21 Video Renderer", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://www.flowchera21.bg5.net",
        "https://flowchera21.bg5.net",
        "https://flowchera21-video-studio.onrender.com",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
WIDTH, HEIGHT, FPS = 1280, 720, 24
MAX_TOTAL_SECONDS = 300
MAX_SCENES = 50
MAX_AUDIO_BYTES = 30 * 1024 * 1024

def font(size, bold=False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()

def wrap_lines(draw, text, face, max_width):
    words = str(text or "").split()
    lines, current = [], ""
    for word in words:
        test = (current + " " + word).strip()
        if current and draw.textbbox((0, 0), test, font=face)[2] > max_width:
            lines.append(current)
            current = word
        else:
            current = test
    if current:
        lines.append(current)
    return lines[:5]

def make_scene_image(scene, index, total, language, output):
    image = Image.new("RGB", (WIDTH, HEIGHT))
    pixels = image.load()
    for y in range(HEIGHT):
        for x in range(WIDTH):
            t = (x / WIDTH * 0.58 + y / HEIGHT * 0.42)
            pixels[x, y] = (int(9 + 14*t), int(19 + 42*t), int(38 + 58*t))
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((850, -210, 1450, 390), fill=(25, 190, 160, 38))
    draw.ellipse((-250, 470, 350, 1070), fill=(70, 110, 240, 30))
    draw.rounded_rectangle((70, 65, 1210, 655), radius=30, fill=(3, 10, 24, 125), outline=(150, 220, 220, 55), width=2)
    title = str(scene.get("title") or f"Scene {index+1}")[:160]
    visual = str(scene.get("visual") or "")[:500]
    narration = str(scene.get("narration") or "")[:1200]
    draw.text((115, 105), f"FLOWCHERA21  •  {index+1:02d}/{total:02d}", font=font(22, True), fill=(123, 229, 205, 255))
    title_font = font(56, True)
    y = 205
    for line in wrap_lines(draw, title, title_font, 1030)[:2]:
        draw.text((115, y), line, font=title_font, fill=(248, 251, 255, 255), stroke_width=1, stroke_fill=(0,0,0,80))
        y += 72
    visual_font = font(27)
    y += 15
    for line in wrap_lines(draw, visual, visual_font, 1020)[:3]:
        draw.text((120, y), line, font=visual_font, fill=(170, 205, 220, 255))
        y += 39
    draw.rounded_rectangle((105, 495, 1175, 615), radius=18, fill=(0, 0, 0, 145))
    subtitle_font = font(29, True)
    lines = wrap_lines(draw, narration, subtitle_font, 990)[:3]
    block_height = len(lines) * 38
    y = 555 - block_height // 2
    for line in lines:
        bbox = draw.textbbox((0,0), line, font=subtitle_font)
        draw.text(((WIDTH-(bbox[2]-bbox[0]))//2, y), line, font=subtitle_font, fill=(255,255,255,255), stroke_width=2, stroke_fill=(0,0,0,230))
        y += 38
    image.save(output, "PNG", optimize=True)

def run_ffmpeg(args):
    result = subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-y", *args], capture_output=True, text=True, timeout=900)
    if result.returncode:
        raise RuntimeError((result.stderr or "FFmpeg failed")[-1800:])


# Best-effort asynchronous jobs. State and output live in the container's temporary
# filesystem; Render Free restarts can interrupt jobs and erase downloads.
from fastapi import BackgroundTasks
from fastapi.responses import FileResponse
import shutil
import threading
import time
import uuid

MAX_JOB_SECONDS = int(os.getenv("MAX_JOB_SECONDS", "3600"))
MAX_JOB_SCENES = 300
JOB_ROOT = Path(tempfile.gettempdir()) / "flowchera21-jobs"
JOB_ROOT.mkdir(parents=True, exist_ok=True)
JOBS = {}
JOBS_LOCK = threading.Lock()
JOB_SEMAPHORE = threading.Semaphore(1)


def _job_update(job_id, **fields):
    with JOBS_LOCK:
        if job_id in JOBS:
            JOBS[job_id].update(fields)


def _render_job_now(job_id, data, audio_payload, audio_name):
    job_dir = JOB_ROOT / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    try:
        scenes = data["scenes"]
        durations = [max(1, min(120, int(s.get("seconds", 10)))) for s in scenes]
        total = sum(durations)
        clips = []
        _job_update(job_id, status="running", stage="rendering_scenes", progress=1,
                    message="Rendering scene segments")
        for i, (scene, seconds) in enumerate(zip(scenes, durations)):
            still = job_dir / f"scene-{i:04d}.png"
            clip = job_dir / f"clip-{i:04d}.mp4"
            make_scene_image(scene, i, len(scenes), data.get("locale", "en"), still)
            frames = seconds * FPS
            vf = (
                f"scale={WIDTH}:{HEIGHT},zoompan=z='min(zoom+0.00035,1.07)':d={frames}:"
                f"s={WIDTH}x{HEIGHT}:fps={FPS},fade=t=in:st=0:d=0.35,"
                f"fade=t=out:st={max(0,seconds-0.35)}:d=0.35,format=yuv420p"
            )
            run_ffmpeg(["-loop","1","-i",str(still),"-t",str(seconds),"-vf",vf,
                        "-r",str(FPS),"-an","-c:v","libx264","-preset","ultrafast",
                        "-crf","24","-pix_fmt","yuv420p",str(clip)])
            clips.append(clip)
            pct = min(80, int((i + 1) / len(scenes) * 80))
            _job_update(job_id, progress=pct, completed_scenes=i+1,
                        message=f"Rendered scene {i+1} of {len(scenes)}")
        _job_update(job_id, stage="assembling", progress=84, message="Assembling MP4")
        concat_file = job_dir / "concat.txt"
        concat_file.write_text("".join(f"file '{p.as_posix()}'\n" for p in clips), encoding="utf-8")
        silent = job_dir / "silent.mp4"
        run_ffmpeg(["-f","concat","-safe","0","-i",str(concat_file),"-c","copy",
                    "-movflags","+faststart",str(silent)])
        output = job_dir / "flowchera21.mp4"
        if audio_payload:
            suffix = Path(audio_name or "narration.mp3").suffix.lower()
            if suffix not in {".mp3",".wav",".m4a",".aac",".ogg"}:
                raise ValueError("Unsupported audio type.")
            audio_path = job_dir / ("narration" + suffix)
            audio_path.write_bytes(audio_payload)
            run_ffmpeg(["-i",str(silent),"-i",str(audio_path),"-map","0:v:0","-map","1:a:0",
                        "-c:v","copy","-c:a","aac","-b:a","128k","-af","apad",
                        "-t",str(total),"-movflags","+faststart",str(output)])
        else:
            run_ffmpeg(["-i",str(silent),"-f","lavfi","-i",
                        "anullsrc=channel_layout=stereo:sample_rate=44100",
                        "-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac",
                        "-shortest","-movflags","+faststart",str(output)])
        if not output.exists() or output.stat().st_size < 1024:
            raise RuntimeError("Rendered MP4 is unexpectedly small.")
        _job_update(job_id, status="completed", stage="complete", progress=100,
                    output_path=str(output), output_bytes=output.stat().st_size,
                    message="MP4 is ready to download", finished_at=time.time())
    except Exception as exc:
        _job_update(job_id, status="failed", stage="failed", message=str(exc)[:700],
                    finished_at=time.time())


def _render_job(job_id, data, audio_payload, audio_name):
    # One FFmpeg render at a time on the single free instance; additional jobs wait.
    with JOB_SEMAPHORE:
        _render_job_now(job_id, data, audio_payload, audio_name)


@app.post("/jobs", status_code=202)
async def create_video_job(background_tasks: BackgroundTasks, project: str = Form(...),
                           audio: UploadFile | None = File(default=None)):
    try:
        data = json.loads(project)
    except Exception:
        raise HTTPException(400, "Project JSON is invalid.")
    scenes = data.get("scenes")
    if not isinstance(scenes, list) or not scenes or len(scenes) > MAX_JOB_SCENES:
        raise HTTPException(400, f"Provide 1 to {MAX_JOB_SCENES} scenes.")
    if data.get("locale", "en") not in {"om", "en", "am"}:
        raise HTTPException(400, "Unsupported language.")
    try:
        durations = [max(1, min(120, int(s.get("seconds", 10)))) for s in scenes]
    except Exception:
        raise HTTPException(400, "Scene durations must be whole numbers.")
    total = sum(durations)
    if total > MAX_JOB_SECONDS:
        raise HTTPException(413, f"Async job limit is {MAX_JOB_SECONDS//60} minutes; increase MAX_JOB_SECONDS only after capacity testing.")
    audio_payload = None
    audio_name = None
    if audio and audio.filename:
        if not audio.filename.lower().endswith((".mp3",".wav",".m4a",".aac",".ogg")):
            raise HTTPException(415, "Upload MP3, WAV, M4A, AAC or OGG audio.")
        audio_payload = await audio.read(MAX_AUDIO_BYTES + 1)
        if len(audio_payload) > MAX_AUDIO_BYTES:
            raise HTTPException(413, f"Audio file must be {MAX_AUDIO_BYTES//(1024*1024)} MB or smaller.")
        audio_name = audio.filename
    with JOBS_LOCK:
        job_id = uuid.uuid4().hex
        queued_count = sum(1 for j in JOBS.values() if j.get("status") in {"queued","running"})
        if queued_count >= 5:
            raise HTTPException(429, "The free renderer queue is full. Wait for a queued job to finish.")
        JOBS[job_id] = {"job_id":job_id,"status":"queued","stage":"queued","progress":0,
                        "queue_position":queued_count+1,
                        "total_seconds":total,"total_scenes":len(scenes),"completed_scenes":0,
                        "created_at":time.time(),"message":"Job queued"}
    background_tasks.add_task(_render_job, job_id, data, audio_payload, audio_name)
    return {"job_id":job_id,"status":"queued","status_url":f"/jobs/{job_id}",
            "download_url":f"/jobs/{job_id}/download","total_seconds":total}


@app.get("/jobs/{job_id}")
def get_video_job(job_id: str):
    with JOBS_LOCK:
        job = JOBS.get(job_id)
        if not job:
            raise HTTPException(404, "Job not found. It may have expired or the service may have restarted.")
        return {k:v for k,v in job.items() if k != "output_path"}


@app.get("/jobs/{job_id}/download")
def download_video_job(job_id: str):
    with JOBS_LOCK:
        job = JOBS.get(job_id)
        if not job:
            raise HTTPException(404, "Job not found.")
        if job.get("status") != "completed":
            raise HTTPException(409, "The MP4 is not ready yet.")
        output_path = job.get("output_path")
    if not output_path or not Path(output_path).is_file():
        raise HTTPException(410, "The MP4 file is no longer available; submit the job again.")
    return FileResponse(output_path, media_type="video/mp4", filename="flowchera21-video.mp4")

@app.get("/health")
def health():
    return {"status":"healthy","renderer":"ffmpeg-h264-aac","max_duration_seconds":MAX_JOB_SECONDS,"synchronous_max_duration_seconds":MAX_TOTAL_SECONDS,"async_jobs":True,"queue_max_jobs":5,"languages":["om","en","am"],"voice_generation":False}

@app.post("/render")
async def render(project: str = Form(...), audio: UploadFile | None = File(default=None)):
    try:
        data = json.loads(project)
    except Exception:
        raise HTTPException(400, "Project JSON is invalid.")
    scenes = data.get("scenes")
    if not isinstance(scenes, list) or not scenes or len(scenes) > MAX_SCENES:
        raise HTTPException(400, f"Provide 1 to {MAX_SCENES} scenes.")
    durations = [max(1, min(120, int(s.get("seconds", 10)))) for s in scenes]
    total = sum(durations)
    if total > MAX_TOTAL_SECONDS:
        raise HTTPException(413, f"Free renderer limit is {MAX_TOTAL_SECONDS//60} minutes per video.")
    language = data.get("locale", "en")
    if language not in {"om","en","am"}:
        raise HTTPException(400, "Unsupported language.")
    if audio and audio.filename:
        if not audio.filename.lower().endswith((".mp3",".wav",".m4a",".aac",".ogg")):
            raise HTTPException(415, "Upload MP3, WAV, M4A, AAC or OGG audio.")
        payload = await audio.read(MAX_AUDIO_BYTES + 1)
        if len(payload) > MAX_AUDIO_BYTES:
            raise HTTPException(413, "Audio file must be 30 MB or smaller.")
    else:
        payload = None
    try:
        with tempfile.TemporaryDirectory(prefix="flowchera21-") as tmp:
            root = Path(tmp)
            clips = []
            for i, (scene, seconds) in enumerate(zip(scenes, durations)):
                still = root / f"scene-{i:03d}.png"
                clip = root / f"clip-{i:03d}.mp4"
                make_scene_image(scene, i, len(scenes), language, still)
                frames = seconds * FPS
                vf = f"scale={WIDTH}:{HEIGHT},zoompan=z='min(zoom+0.00035,1.07)':d={frames}:s={WIDTH}x{HEIGHT}:fps={FPS},fade=t=in:st=0:d=0.35,fade=t=out:st={max(0,seconds-0.35)}:d=0.35,format=yuv420p"
                run_ffmpeg(["-loop","1","-i",str(still),"-t",str(seconds),"-vf",vf,"-r",str(FPS),"-an","-c:v","libx264","-preset","ultrafast","-crf","24","-pix_fmt","yuv420p",str(clip)])
                clips.append(clip)
            concat_file = root / "concat.txt"
            concat_file.write_text("".join(f"file '{p.as_posix()}'\n" for p in clips), encoding="utf-8")
            silent = root / "silent.mp4"
            run_ffmpeg(["-f","concat","-safe","0","-i",str(concat_file),"-c","copy","-movflags","+faststart",str(silent)])
            output = root / "flowchera21.mp4"
            if payload:
                audio_path = root / ("narration" + Path(audio.filename).suffix.lower())
                audio_path.write_bytes(payload)
                run_ffmpeg(["-i",str(silent),"-i",str(audio_path),"-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","128k","-af","apad","-t",str(total),"-movflags","+faststart",str(output)])
            else:
                run_ffmpeg(["-i",str(silent),"-f","lavfi","-i","anullsrc=channel_layout=stereo:sample_rate=44100","-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-shortest","-movflags","+faststart",str(output)])
            video_bytes = output.read_bytes()
            if len(video_bytes) < 1024:
                raise RuntimeError("Rendered MP4 is unexpectedly small.")
            return Response(
                content=video_bytes,
                media_type="video/mp4",
                headers={
                    "Content-Disposition": 'attachment; filename="flowchera21-video.mp4"',
                    "X-Video-Duration": str(total),
                    "X-Video-Format": "mp4",
                },
            )
    except HTTPException:
        raise
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "Video render timed out. Try fewer scenes or shorter duration.")
    except Exception as exc:
        raise HTTPException(500, f"MP4 render failed: {str(exc)[:600]}")
