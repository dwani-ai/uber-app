# syntax=docker/dockerfile:1
# dwani-ai/tts-indic-server — CUDA runtime, Indic TTS FastAPI (:10804). Requires NVIDIA Container Toolkit on the host.

FROM nvidia/cuda:12.8.0-cudnn-runtime-ubuntu22.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python3-pip \
    python3-venv \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/python3 /usr/bin/python
RUN python -m pip install --upgrade pip

WORKDIR /app

ARG REPO_URL=https://github.com/dwani-ai/tts-indic-server.git
ARG REPO_REF=main
RUN git clone --depth 1 --branch "${REPO_REF}" "${REPO_URL}" /tmp/r \
  && cp -a /tmp/r/. /app \
  && rm -rf /tmp/r .git

RUN pip install --no-cache-dir --no-deps -r requirements.txt

RUN useradd -ms /bin/bash appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 10804

CMD ["python", "/app/src/server/main.py", "--host", "0.0.0.0", "--port", "10804"]
