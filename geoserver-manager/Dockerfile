FROM python:3.10-slim

WORKDIR /app

COPY app/ .

RUN pip install --no-cache-dir -r requirements.txt

# Make upload dir
RUN mkdir -p /app/temp_storage

# Set environment variable if needed
ENV FLASK_APP=/app/main.py

# Production entrypoint using gunicorn
CMD ["gunicorn", "-b", "0.0.0.0:5000", "main:app"]

