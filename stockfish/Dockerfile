FROM ubuntu:24.04

# Avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y socat wget ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Download Stockfish 18
RUN mkdir -p /tmp/sf18 && \
    wget -qO- https://github.com/official-stockfish/Stockfish/releases/download/sf_18/stockfish-ubuntu-x86-64.tar | tar -C /tmp/sf18 -xf - && \
    find /tmp/sf18 -type f -name "stockfish-*" -exec cp {} /usr/local/bin/stockfish_18 \; && \
    chmod +x /usr/local/bin/stockfish_18 && \
    rm -rf /tmp/sf18

# Download Stockfish 17
RUN mkdir -p /tmp/sf17 && \
    wget -qO- https://github.com/official-stockfish/Stockfish/releases/download/sf_17/stockfish-ubuntu-x86-64.tar | tar -C /tmp/sf17 -xf - && \
    find /tmp/sf17 -type f -name "stockfish-*" -exec cp {} /usr/local/bin/stockfish_17 \; && \
    chmod +x /usr/local/bin/stockfish_17 && \
    rm -rf /tmp/sf17

# Download Stockfish 16
RUN mkdir -p /tmp/sf16 && \
    wget -qO- https://github.com/official-stockfish/Stockfish/releases/download/sf_16/stockfish-ubuntu-x86-64.tar | tar -C /tmp/sf16 -xf - && \
    find /tmp/sf16 -type f -name "stockfish-*" -exec cp {} /usr/local/bin/stockfish_16 \; && \
    chmod +x /usr/local/bin/stockfish_16 && \
    rm -rf /tmp/sf16

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 3333 3334 3335

ENTRYPOINT ["/entrypoint.sh"]
