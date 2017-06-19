export NODE_ENV=production
cd ~/robotfirefighter
gulp build
cp -r client/assets/images/* dist/client/assets/images/
node dist/server/app.js


### dev/debug mode
export NODE_ENV=""
