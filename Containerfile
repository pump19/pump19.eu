FROM docker.io/denoland/deno:alpine

ARG JJ_REVISION
ENV DENO_DEPLOYMENT_ID=${JJ_REVISION}

# we bring our own user
RUN ["deluser", "--remove-home", "deno"]
RUN ["addgroup", "-S", "-g", "1919", "pump19"]
RUN ["adduser", "-S", "-u", "1919", "-G", "pump19", "pump19"]

WORKDIR /app
COPY . .

RUN ["chown", "-R", "pump19:pump19", "/app", "/deno-dir"]

USER pump19
RUN ["deno", "cache", "main.ts"]
RUN ["deno", "task", "build"]

EXPOSE 8000

CMD ["run", "--allow-env", "--allow-read", "--allow-write", "--allow-net", "--allow-ffi", "--unstable-kv", "main.ts"]
