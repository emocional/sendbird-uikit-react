#!/usr/bin/env bash
set -euo pipefail

echo "cambio dependencia de emo-front a local path de sendbird-uikit-react"
if [[ "$(uname)" == "Darwin" ]]; then
  sed -i '' 's/uikit-react.*/uikit-react": "file:\/\/..\/sendbird-uikit-react\/dist",/' ../emo-front/package.json
else
  sed -i 's/uikit-react.*/uikit-react": "file:\/\/..\/sendbird-uikit-react\/dist",/' ../emo-front/package.json
fi

echo "build del fork"
yarn build

echo "voy al path de emo-front"
cd ../emo-front

echo "install"
pnpm i
