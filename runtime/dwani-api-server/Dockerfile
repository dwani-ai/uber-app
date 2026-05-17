# syntax=docker/dockerfile:1
# dwani-ai/dwani-api-server — FastAPI (Swagger at /docs), upstream port 18888.

FROM python:3.12-slim-bookworm
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends git poppler-utils \
  && rm -rf /var/lib/apt/lists/*

ARG REPO_URL=https://github.com/dwani-ai/dwani-api-server.git
ARG REPO_REF=main
RUN git clone --depth 1 --branch "${REPO_REF}" "${REPO_URL}" /tmp/r \
  && cp -a /tmp/r/. /app \
  && rm -rf /tmp/r .git

COPY patch_uberapp_cors.py ./
RUN python patch_uberapp_cors.py

RUN pip install --no-cache-dir --upgrade pip \
  && pip install --no-cache-dir -r requirements.txt

ENV PYTHONUNBUFFERED=1
EXPOSE 18888

RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

CMD ["uvicorn", "src.server.main:app", "--host", "0.0.0.0", "--port", "18888"]
