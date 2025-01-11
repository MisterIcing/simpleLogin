FROM node:18-slim AS build
    COPY login/ /tmp/webgui

    # Build webapp for deployment
    WORKDIR /tmp/webgui
    RUN npm i \
        && npm run build

FROM ubuntu:noble AS prod
    ENV MYSQL_ROOT_PASS='root'
    ENV MYSQL_DATABASE='loginpage'
    ENV MYSQL_USER='admin'
    ENV MYSQL_PASS='Admin123$'

    WORKDIR /app
    RUN apt update && apt install -y curl \
        && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash \
        && export NVM_DIR="$HOME/.nvm" \
        && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" \
        && nvm install 18.19.1 \
        && npm install -g serve

    RUN apt update && apt install -y \
        python3-flask \
        python3-flask-cors \
        python3-eventlet \
        python3-cffi \
        python3-bcrypt \
        gunicorn \
        mysql-server \
        mysql-client \
        libmysqlclient-dev \
        python3-mysql.connector

    COPY --from=build /tmp/webgui/build /app/frontend
    COPY backend/backend.py /app/backend/backend.py
    COPY backend/cert.pem /app/cert.pem
    COPY backend/key.pem /app/key.pem

    # wrapper
    RUN echo "#!/bin/bash" > /app/log-wrapper.sh \
        && echo "while read line; do echo \"[\$1] \$line\"; done" >> /app/log-wrapper.sh \
        && chmod +x /app/log-wrapper.sh

    RUN echo "#!/bin/bash" > init \
        && echo "export PATH=\$PATH:/root/.nvm/versions/node/v18.19.1/bin" >> init \
        && echo "mysqld --initialize-insecure" >> init \
        && echo "mysqld_safe 2>&1 | /app/log-wrapper.sh 'DB:SAFE' &" >> init \
        && echo "until mysqladmin ping -h localhost --silent; do sleep 1; done" >> /app/init \
        && echo "mysql -u root -e \"CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE};\"" >> init \
        && echo "mysql -u root -e \"CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASS}';\"" >> init \
        && echo "mysql -u root -e \"GRANT ALL PRIVILEGES ON ${MYSQL_DATABASE}.* TO '${MYSQL_USER}'@'localhost';\"" >> init \
        && echo "mysql -u root -e \"FLUSH PRIVILEGES;\"" >> init \
        && echo "serve -s frontend --ssl-cert /app/cert.pem --ssl-key /app/key.pem -l 3000 2>&1 | /app/log-wrapper.sh FRONTEND &" >> init \
        && echo "gunicorn --certfile cert.pem --keyfile key.pem -b '0.0.0.0:5000' 'backend.backend:app' --workers 1 --log-level info --access-logfile - --worker-class eventlet 2>&1 | /app/log-wrapper.sh GUNICORN &" >> init \
        && echo "wait" >> init \
        && chmod +x init
    
EXPOSE 3000 5000
CMD [ "/bin/bash", "/app/init" ]
# ENTRYPOINT [ "/bin/bash" ]
