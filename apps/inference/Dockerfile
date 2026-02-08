FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
# libcairo2-dev and pkg-config are required for pycairo (dependency of xhtml2pdf)
# build-essential is required for compiling python extensions
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libjpeg-dev \
    zlib1g-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Environment setup
ENV PYTHONUNBUFFERED=1

# Run gunicorn
# Use shell form to allow variable expansion of $PORT (default to 8000 if not set)
CMD gunicorn flask_app:app --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120
