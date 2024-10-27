FROM docker.io/denoland/deno:distroless

ARG JJ_REVISION
ENV DENO_DEPLOYMENT_ID=${JJ_REVISION}

WORKDIR /app

COPY . .
RUN ["deno", "cache", "main.ts"]
RUN ["deno", "task", "build"]

EXPOSE 8000

CMD ["run", "--allow-env", "--allow-read", "--allow-write", "--allow-net", "--allow-ffi", "--unstable-kv", "main.ts"]
