#!/bin/sh
set -e

bun run migrate.js
bun run main.js
