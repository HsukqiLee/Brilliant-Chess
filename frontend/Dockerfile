FROM node:22-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_BACKEND_URL=/api
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && rm -rf dist/engine

FROM nginx:1.31-alpine AS runner
WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
