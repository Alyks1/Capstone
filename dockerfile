FROM ubuntu

WORKDIR /

#Install Node
RUN apt-get update
RUN apt-get install curl -y
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install nodejs -y
RUN node -v
RUN npm -v
#Install Pnpm
RUN npm install -g pnpm@7.29.1
COPY pnpm-lock.yaml .
#Install Chromium for puppeteer
RUN apt-get install chromium-bsu -y
RUN apt-get install chromium-browser -y
#Setup pnpm
RUN pnpm fetch --prod
ADD . ./

#Install the rest
RUN pnpm install -r --offline --prod
RUN cd backend && pnpm prisma generate

EXPOSE 3000

CMD [ "pnpm", "start" ]