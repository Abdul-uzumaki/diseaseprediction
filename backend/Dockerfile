# Use official Python image with a compatible version
FROM python:3.10-slim-bullseye


# Install system dependencies for pandas and build tools
RUN apt-get update && apt-get install -y build-essential python3-dev libatlas-base-dev
RUN pip install --upgrade pip setuptools wheel
RUN pip install numpy==1.24.4
RUN pip install -r requirements.txt

# Set working directory inside the container
WORKDIR /app

# Copy all backend files to the container
COPY . /app

# Upgrade pip and install Python dependencies
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

# Command to run the Flask app with gunicorn
CMD gunicorn app:app --bind 0.0.0.0:$PORT
