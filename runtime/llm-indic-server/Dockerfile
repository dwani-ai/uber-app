# syntax=docker/dockerfile:1
# dwani-ai/llm-indic-server — Ubuntu + Rust + torch stack (:7860). Use with `gpus: all` when CUDA drivers are available.

FROM ubuntu:22.04
WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    ffmpeg \
    sudo \
    wget \
    libvips42 \
    build-essential \
    curl \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

RUN pip install --upgrade pip setuptools setuptools-rust torch

ARG REPO_URL=https://github.com/dwani-ai/llm-indic-server.git
ARG REPO_REF=main
RUN git clone --depth 1 --branch "${REPO_REF}" "${REPO_URL}" /tmp/r \
  && cp -a /tmp/r/. /app \
  && rm -rf /tmp/r .git

RUN pip install --no-cache-dir -r server-requirements.txt

RUN useradd -ms /bin/bash appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 7860

CMD ["python", "/app/src/server/main.py", "--host", "0.0.0.0", "--port", "7860"]
