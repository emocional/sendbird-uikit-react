echo "cambio dependencia de emo-front a local path de sendbird-uikit-react"
sed -i 's/uikit-react.*/uikit-react": "file:\/\/..\/sendbird-uikit-react\/dist",/' ../emo-front/package.jsonecho "build del fork"
yarn build
echo "voy al path de emo-front"
cd ../emo-front
echo "install"
pnpm i