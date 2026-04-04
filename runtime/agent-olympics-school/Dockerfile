# syntax=docker/dockerfile:1
# Gradio UI for sachinsshetty/agent-olympics-school (frontend/ux.py, :8080).

FROM python:3.11-slim-bookworm
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*

ARG SCHOOL_REPO_URL=https://github.com/sachinsshetty/agent-olympics-school.git
RUN git clone --depth 1 "${SCHOOL_REPO_URL}" /tmp/repo \
  && cp -a /tmp/repo/. /app/repo \
  && rm -rf /tmp/repo

COPY patch_backend.py /app/patch_backend.py
RUN python /app/patch_backend.py

WORKDIR /app/repo/frontend

RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1
EXPOSE 8080

RUN useradd -m -u 1000 appuser \
  && chown -R appuser:appuser /app
USER appuser

CMD ["python", "ux.py"]
