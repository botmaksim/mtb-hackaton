FROM python:3.12-slim

WORKDIR /app

# Установка системных зависимостей для сборки некоторых пакетов
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Используем python3 (согласно твоему Ledger)
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]