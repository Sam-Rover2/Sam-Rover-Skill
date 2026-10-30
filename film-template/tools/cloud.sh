#!/bin/sh
# Only for the cloud sandbox (no GPU): local Chrome + software WebGL.
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
export REMOTION_GL=swangle
exec npx remotion "$@"
