FROM python:3.11-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install ffmpeg for audio processing
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy source code
COPY . .

# Set as executable
RUN chmod +x transcribe.py

# Set entry point for command-line usage
ENTRYPOINT ["python", "transcribe.py"]