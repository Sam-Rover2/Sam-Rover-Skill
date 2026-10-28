#!/bin/sh
# Render helper for this cloud sandbox: no GPU and no internet for Remotion's own Chrome.
# Locally just use: npm run anim:render -- ToonTest out/toon-test.mp4
export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
export REMOTION_GL=swangle
exec npx remotion "$@"
