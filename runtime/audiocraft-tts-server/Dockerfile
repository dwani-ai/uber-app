# syntax=docker/dockerfile:1
# slabstech/audiocraft-tts-server — same layout as parler stack; PyTorch CUDA 12.4 (:8000).

FROM pytorch/pytorch:2.5.1-cuda12.4-cudnn9-runtime

RUN apt-get update && \
    apt-get install -y git curl software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y python3.12 python3.12-distutils && \
    curl -sS https://bootstrap.pypa.io/get-pip.py | python3.12 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ARG REPO_URL=https://github.com/slabstech/audiocraft-tts-server.git
ARG REPO_REF=master

WORKDIR /root
RUN git clone --depth 1 --branch "${REPO_REF}" "${REPO_URL}" audiocraft-tts-server

WORKDIR /root/audiocraft-tts-server

RUN pip3.12 install --no-cache-dir --no-deps git+https://github.com/huggingface/parler-tts.git
RUN pip3.12 install --no-cache-dir -r model_requirements.txt
RUN pip3.12 install --no-cache-dir -r server_requirements.txt

ENV UVICORN_HOST=0.0.0.0
ENV UVICORN_PORT=8000
EXPOSE 8000

CMD ["uvicorn", "parler_tts_server.main:app", "--host", "0.0.0.0", "--port", "8000"]
