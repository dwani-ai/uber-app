# syntax=docker/dockerfile:1
# sachinsshetty/faster-whisper-server — CPU image (upstream Dockerfile.cpu), OpenAPI at /docs.

FROM ghcr.io/astral-sh/uv:0.5.1 AS uvbin
FROM ubuntu:24.04

COPY --from=uvbin /uv /bin/uv

RUN apt-get update \
  && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ffmpeg python3.12 python3.12-venv git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /root/faster-whisper-server

ARG REPO_URL=https://github.com/sachinsshetty/faster-whisper-server.git
ARG REPO_REF=master
RUN git clone --depth 1 --branch "${REPO_REF}" "${REPO_URL}" /tmp/r \
  && cp -a /tmp/r/. . \
  && rm -rf /tmp/r .git

ENV WHISPER__MODEL=Systran/faster-whisper-small
ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=8000

RUN uv sync --frozen --no-install-project || uv sync --no-install-project
RUN uv sync --frozen --extra ui || uv sync --extra ui

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "--factory", "faster_whisper_server.main:create_app", "--host", "0.0.0.0", "--port", "8000"]
