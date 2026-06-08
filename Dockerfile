# Eén-staps image, bewust simpel en betrouwbaar voor Coolify op je eigen VPS.
# Bij de start synct de container het databaseschema en draait de seed.
FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache openssl

# Dependencies (incl. dev, nodig voor build, prisma CLI en tsx-seed)
COPY package.json package-lock.json* ./
RUN npm ci

# Broncode en build
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

# Bij start: schema naar de database pushen, seed draaien (idempotent), dan starten.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx prisma db seed; node_modules/.bin/next start -p 3000 -H 0.0.0.0"]
