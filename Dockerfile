FROM python:3.11-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY video-renderer/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY video-renderer/app.py ./app.py
ENV PORT=10000
CMD ["sh","-c","uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
