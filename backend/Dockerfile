FROM python:3.10-slim-bullseye

# Set working directory
WORKDIR /app

# Copy requirements.txt first for caching
COPY requirements.txt .

# Upgrade pip and install numpy first to avoid incompatibility
RUN pip install --upgrade pip setuptools wheel
RUN pip install numpy==1.24.4

# Install rest of dependencies
RUN pip install -r requirements.txt

# Copy all other source code files
COPY . .

# Start the Flask app with gunicorn, binding to Render's port
CMD ["sh", "-c", "gunicorn app:app --bind 0.0.0.0:$PORT"]
