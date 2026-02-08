# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libcairo2-dev \
    libjpeg-dev \
    zlib1g-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Final stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime system dependencies only
# libcairo2 is needed for runtime (pycairo)
# ca-certificates is needed for SSL database connections (Neon)
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libjpeg62-turbo \
    ca-certificates \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY . .

# Environment setup
ENV PYTHONUNBUFFERED=1

# Run gunicorn
# Use shell form to allow variable expansion of $PORT
CMD gunicorn flask_app:app --bind 0.0.0.0:${PORT:-8000} --workers 1 --timeout 120 --log-level debug --access-logfile - --error-logfile -
