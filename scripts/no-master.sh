#!/bin/sh

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" = "stable" ]; then
  echo "[ERROR] You shouldn't commit directly to the stable branch"
  echo "[INFO] If this is intended, use --skip-verify"
  exit 1
fi