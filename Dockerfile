FROM node:16.14.0

# ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY . .

# RUN npm install
# If you are building your code for production
# RUN npm install

# VOLUME /usr/src/app/data

# Bundle app source


RUN npm install --no-audit
RUN npm run build_prod

CMD [ "npm", "run", "start_prod" ]
