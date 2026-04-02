# syntax=docker/dockerfile:1
# Gradio workshop (dwani-ai/workshop): clone at build time, listen on :8000 (see workshop_demo.py).

FROM python:3.11-slim-bookworm AS clone
RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /src
ARG WORKSHOP_REPO_URL=https://github.com/dwani-ai/workshop.git
RUN git clone --depth 1 "${WORKSHOP_REPO_URL}" app

FROM python:3.11-slim-bookworm
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg libsndfile1 \
  && rm -rf /var/lib/apt/lists/*

COPY --from=clone /src/app/ ./
COPY patch_demo.py ./
RUN python patch_demo.py

RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt openai

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

RUN useradd -m -u 1000 appuser \
  && chown -R appuser:appuser /app
USER appuser

CMD ["python", "workshop_demo.py"]
