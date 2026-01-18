FROM python:3.11-slim

WORKDIR /app

# Install curl for poetry installation
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="/root/.local/bin:$PATH"

# Copy poetry files
COPY pyproject.toml poetry.lock* ./

# Configure poetry
RUN poetry config virtualenvs.create false

# Install dependencies
RUN poetry install --no-interaction --no-ansi --no-root || pip install redis numpy python-dotenv

# Copy application code
COPY . .

# Run the simulation
CMD ["python", "main.py"]
