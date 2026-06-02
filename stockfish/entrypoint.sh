#!/bin/bash
# Start socat listener for Stockfish 18 (Latest/Large) on port 3333, using the wrapper
socat TCP-LISTEN:3333,fork,reuseaddr EXEC:"/usr/local/bin/stockfish_wrapper /usr/local/bin/stockfish_18" &

# Start socat listener for Stockfish 17 (Medium) on port 3334, using the wrapper
socat TCP-LISTEN:3334,fork,reuseaddr EXEC:"/usr/local/bin/stockfish_wrapper /usr/local/bin/stockfish_17" &

# Start socat listener for Stockfish 16 (Small) on port 3335, using the wrapper
socat TCP-LISTEN:3335,fork,reuseaddr EXEC:"/usr/local/bin/stockfish_wrapper /usr/local/bin/stockfish_16" &

# Wait for all background processes
wait
