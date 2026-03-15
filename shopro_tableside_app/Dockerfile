# Build stage
FROM ghcr.io/cirruslabs/flutter:stable AS build
WORKDIR /app

# Copy pubspec and get dependencies using cache mount
COPY pubspec.* ./
RUN flutter pub get

# Copy source and build web
COPY . .
ARG API_HOST=shopro.afriqpay.com
ARG API_PORT=8080
RUN flutter build web --release --dart-define=API_HOST=$API_HOST --dart-define=API_PORT=$API_PORT

# Run stage
FROM nginx:alpine
COPY --from=build /app/build/web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
