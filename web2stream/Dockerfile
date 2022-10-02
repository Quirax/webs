FROM node:latest as builder

# Create working directory
# RUN mkdir /usr/src
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Set PATH env
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# Update npm
RUN npm i -g npm

# Install pulseaudio
RUN apt-get update
RUN apt-get install libasound2 libasound2-plugins alsa-utils alsa-oss -y
RUN apt-get install pulseaudio pulseaudio-utils -y
RUN usermod -aG pulse,pulse-access root

# Install redis
# RUN apt-get install lsb-release -y
# RUN curl -fsSL https://packages.redis.io/gpg | gpg --dearmor -o /usr/share/keyrings/redis-archive-keyring.gpg
# RUN echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/redis.list
# RUN apt-get update
# RUN apt-get install redis -y

# Install graphic driver
# RUN apt install -yq libmfx1 libmfx-tools libva-drm2 libva-x11-2 vainfo intel-media-va-driver
# ENV LIBVA_DRIVER_NAME=iHD

# Install ffmpeg
RUN apt install ffmpeg -y

# Install chrome
RUN apt-get install -y libappindicator1 fonts-liberation libatk-bridge2.0-0 libatspi2.0-0 libgtk-3-0 libnspr4 libnss3 xdg-utils
# RUN apt-get install -yq \
#     x11-apps \
#     x11-xkb-utils \
#     x11vnc \
#     xdg-utils \
#     xfonts-100dpi \
#     xfonts-75dpi \
#     xfonts-cyrillic \
#     xfonts-scalable \
#     xvfb \
#     fvwm \
#     xterm
# RUN apt-get install --fix-broken -y
# RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
# RUN dpkg -i google-chrome*.deb

# Hangul support
RUN apt install -y udev fonts-freefont-ttf tzdata
RUN mkdir /usr/share/fonts/nanumfont
RUN wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip
RUN unzip NanumFont_TTF_ALL.zip -d /usr/share/fonts/nanumfont
RUN fc-cache -f -v
RUN ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
ENV LANG=ko_KR.UTF-8 \
    LANGUAGE=ko_KR.UTF-8

# For experimental
RUN apt install -y vim

# Copy sources to working directory
COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app

RUN npm install

COPY . /usr/src/app

# Open necessary ports
EXPOSE 8080

# Launch
# WORKDIR /usr/src/app/web
CMD ["node", "index.js"]