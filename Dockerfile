FROM python:3.11-slim

WORKDIR /app


RUN apt-get update && \
    apt-get install -y \
    ca-certificates \
    curl \
    wget \
    openssl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*


RUN update-ca-certificates --fresh && \   
    wget -O /tmp/cacert.pem https://curl.se/ca/cacert.pem && \    
    cp /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt.backup && \    
    cp /tmp/cacert.pem /etc/ssl/certs/ca-certificates.crt && \   
    chmod 644 /etc/ssl/certs/ca-certificates.crt && \    
    update-ca-certificates && \    
    rm -f /tmp/cacert.pem


ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV SSL_CERT_DIR=/etc/ssl/certs
ENV CURL_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt
ENV PYTHONHTTPSVERIFY=1
ENV PYTHONCASSLVERIFY=1


RUN pip install --upgrade pip certifi requests urllib3

COPY requirements.txt /app/
RUN pip install -r requirements.txt


RUN echo '#!/bin/bash\n\
echo "=== VERIFICAÇÃO SSL ==="\n\
python -c "import ssl; print(f\"Python SSL version: {ssl.OPENSSL_VERSION}\")" || echo "Erro SSL Python"\n\
python -c "import requests; r = requests.get(\"https://httpbin.org/get\", timeout=10); print(f\"Teste HTTPS: {r.status_code}\")" || echo "Erro HTTPS requests"\n\
echo "Certificados disponíveis: $(ls -la /etc/ssl/certs/ca-certificates.crt)"\n\
echo "=== FIM VERIFICAÇÃO ==="\n\
exec "$@"' > /entrypoint.sh && chmod +x /entrypoint.sh

COPY . /app

ENTRYPOINT ["/entrypoint.sh"]
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]