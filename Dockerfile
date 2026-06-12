# ==========================================
# Stage 1: Build
# ==========================================
FROM node:22-alpine AS builder

# 
RUN npm install -g pnpm@9.15.0

WORKDIR /meeting-system-web

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build Nuxt SPA
RUN pnpm build

# ==========================================
# Stage 2: Nginx
# ==========================================
FROM nginx:alpine

# Copy built static files
COPY --from=builder /meeting-system-web/dist /usr/share/nginx/html

# 复制 SSL 证书和密钥
COPY localhost+4.pem /etc/ssl/certs/server.crt
COPY localhost+4-key.pem /etc/ssl/private/server.key

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80
EXPOSE 443

LABEL service.type=https
LABEL service.lang=js
LABEL service.framework=vue

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
