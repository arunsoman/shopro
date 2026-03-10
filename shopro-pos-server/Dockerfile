# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy gradle wrapper and settings
COPY gradlew .
COPY gradle gradle
COPY settings.gradle .
COPY build.gradle .
COPY shopro-pos-server/build.gradle shopro-pos-server/

# Download dependencies using cache mount
RUN --mount=type=cache,target=/root/.gradle ./gradlew :shopro-pos-server:dependencies --no-daemon

# Copy only the server source
COPY shopro-pos-server/src shopro-pos-server/src

# Remove other modules from settings.gradle
RUN sed -i '/include .shopro-pos-web./d' settings.gradle && \
    sed -i '/include .shopro-pos-flutter./d' settings.gradle && \
    sed -i '/include .shopro_tableside_app./d' settings.gradle

# Build the server module specifically using cache mount
RUN --mount=type=cache,target=/root/.gradle ./gradlew :shopro-pos-server:build -x test --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add a non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Copy the JAR from the build stage
# Assuming the JAR name is consistent, adjust if needed
COPY --from=build /app/shopro-pos-server/build/libs/*.jar app.jar

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R spring:spring /app

USER spring:spring

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
