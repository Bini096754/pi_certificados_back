FROM oven/bun AS base

WORKDIR /app

COPY . .

FROM base AS dev
RUN bun i
EXPOSE 8000
CMD ["bun", "run", "dev"]

FROM base AS prod
RUN bun i
EXPOSE 8001
RUN bun run build
