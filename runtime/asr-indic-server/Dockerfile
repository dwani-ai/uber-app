# syntax=docker/dockerfile:1
# dwani-ai/asr-indic-server — CUDA runtime, Indic ASR FastAPI (:10803). Requires NVIDIA Container Toolkit on the host.

FROM nvidia/cuda:12.8.0-cudnn-runtime-ubuntu22.04
WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    ffmpeg \
    sudo \
    wget \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

ARG REPO_URL=https://github.com/dwani-ai/asr-indic-server.git
ARG REPO_REF=main
RUN git clone --depth 1 --branch "${REPO_REF}" "${REPO_URL}" /tmp/r \
  && cp -a /tmp/r/. /app \
  && rm -rf /tmp/r .git

RUN pip install --no-cache-dir --no-deps -r docker-requirements.txt
RUN pip install typing_extensions typing_inspection annotated_types
RUN pip install anyio torch==2.7.1 torchaudio torchcodec
RUN pip install packaging regex numpy
RUN pip install huggingface_hub safetensors transformers
RUN pip install python-multipart

RUN useradd -ms /bin/bash appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 10803

CMD ["python", "/app/src/server/asr_api.py", "--host", "0.0.0.0", "--port", "10803"]
