FROM ubuntu:26.04

# Avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && \
    apt-get install -y socat wget ca-certificates stockfish && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Architecture to build (x86-64, x86-64-sse41-popcnt, x86-64-avx2, x86-64-bmi2, x86-64-avx512, x86-64-vnni512)
ARG STOCKFISH_ARCH=x86-64

# Download Stockfish 18
RUN mkdir -p /tmp/sf18 && \
    wget -qO- "https://github.com/official-stockfish/Stockfish/releases/download/sf_18/stockfish-ubuntu-${STOCKFISH_ARCH}.tar" | tar -C /tmp/sf18 -xf - && \
    find /tmp/sf18 -type f -name "stockfish-*" -exec cp {} /usr/local/bin/stockfish_18 \; && \
    chmod +x /usr/local/bin/stockfish_18 && \
    rm -rf /tmp/sf18

# Download Stockfish 17
RUN mkdir -p /tmp/sf17 && \
    wget -qO- "https://github.com/official-stockfish/Stockfish/releases/download/sf_17/stockfish-ubuntu-${STOCKFISH_ARCH}.tar" | tar -C /tmp/sf17 -xf - && \
    find /tmp/sf17 -type f -name "stockfish-*" -exec cp {} /usr/local/bin/stockfish_17 \; && \
    chmod +x /usr/local/bin/stockfish_17 && \
    rm -rf /tmp/sf17

# Download Stockfish 16 (with fallback mapping as it has fewer builds)
RUN mkdir -p /tmp/sf16 && \
    ARCH_SF16="x86-64" && \
    if [ "$STOCKFISH_ARCH" = "x86-64-sse41-popcnt" ]; then ARCH_SF16="x86-64-modern"; \
    elif [ "$STOCKFISH_ARCH" = "x86-64-avx2" ] || [ "$STOCKFISH_ARCH" = "x86-64-bmi2" ] || [ "$STOCKFISH_ARCH" = "x86-64-avx512" ] || [ "$STOCKFISH_ARCH" = "x86-64-vnni512" ]; then ARCH_SF16="x86-64-avx2"; fi && \
    wget -qO- "https://github.com/official-stockfish/Stockfish/releases/download/sf_16/stockfish-ubuntu-${ARCH_SF16}.tar" | tar -C /tmp/sf16 -xf - && \
    find /tmp/sf16 -type f -name "stockfish-*" -exec cp {} /usr/local/bin/stockfish_16 \; && \
    chmod +x /usr/local/bin/stockfish_16 && \
    rm -rf /tmp/sf16

# Copy wrapper script for performance tuning
COPY stockfish_wrapper /usr/local/bin/stockfish_wrapper
RUN chmod +x /usr/local/bin/stockfish_wrapper

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3333 3334 3335

ENTRYPOINT ["/entrypoint.sh"]
