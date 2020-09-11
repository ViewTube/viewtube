#!/bin/sh

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" = "master" ]; then
  echo "[ERROR] You shouldn't commit directly to master branch"
  echo "[INFO] If this is intended, use --skip-verify"
  exit 1
fi