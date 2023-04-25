FROM --platform=linux/amd64 node:18

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

#Install Pnpm
RUN npm install -g pnpm@7.29.1

# Add user
RUN useradd -ms /bin/bash user -d /home/user/app -G audio,video
USER user

WORKDIR /home/user/app

COPY pnpm-lock.yaml .

#Setup pnpm
RUN pnpm fetch --prod
ADD --chown=user:user . ./

#Install the rest
RUN pnpm install -r --offline --prod
RUN cd backend && pnpm prisma generate

EXPOSE 3000

CMD [ "pnpm", "start" ]