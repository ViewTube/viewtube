#/bin/bash

echo "Starting server build"
START=$(date +%s.%N)
rm -rf server/dist
NODE_ENV=production
yarn workspace server run build
END=$(date +%s.%N)
DIFF=$(echo "$END - $START" | bc)
echo "Server build done in ${DIFF}s"
