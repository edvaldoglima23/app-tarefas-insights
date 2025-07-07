FROM python:3.11
WORKDIR /app
COPY . /app/

RUN pip install --upgrade pip
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]