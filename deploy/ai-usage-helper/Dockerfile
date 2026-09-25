FROM oven/bun:1-alpine
WORKDIR /app
RUN bun add zai-usage@0.7.0
COPY scripts/mac-ai-usage-helper.ts /app/helper.ts
USER bun
ENV SLATE_AI_HELPER_HOST=0.0.0.0 \
    SLATE_AI_HELPER_PORT=19091 \
    SLATE_AI_HELPER_ALLOWED_IP=* \
    SLATE_ZAI_BIN=/app/node_modules/.bin/zai-usage \
    SLATE_ZAI_USAGE_BIN=/app/node_modules/.bin/zai-usage \
    ZAI_KEYFILE=/run/secrets/zai.env
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://127.0.0.1:19091/healthz >/dev/null || exit 1
CMD ["bun", "/app/helper.ts"]
