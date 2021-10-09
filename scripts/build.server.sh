#/bin/sh

START=$(date +%s.%N)
rm -rf server/dist
NODE_ENV=production
yarn workspace server run build
END=$(date +%s.%N)
DIFF=$(echo "$END - $START" | bc)
echo "Done in ${DIFF}s"