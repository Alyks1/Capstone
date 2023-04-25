FROM ubuntu:22.04

WORKDIR /

#Install Node
RUN apt-get update \
    && apt-get install curl chromium-bsu chromium-browser -y \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

#Install Pnpm
RUN npm install -g pnpm@7.29.1
COPY pnpm-lock.yaml .

#Setup pnpm
RUN pnpm fetch --prod
ADD . ./

#Install the rest
RUN pnpm install -r --offline --prod
RUN cd backend && pnpm prisma generate

EXPOSE 3000

CMD [ "pnpm", "start" ]