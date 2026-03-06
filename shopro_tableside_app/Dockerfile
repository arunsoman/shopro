# Build stage
FROM ghcr.io/cirruslabs/flutter:stable AS build
WORKDIR /app

# Copy pubspec and get dependencies
COPY pubspec.* ./
RUN flutter pub get

# Copy source and build web
COPY . .
RUN flutter build web --release

# Run stage
FROM nginx:alpine
COPY --from=build /app/build/web /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
