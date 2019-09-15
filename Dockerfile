FROM node:12.2.0-alpine

RUN mkdir -p /projects
COPY . /projects
WORKDIR /projects

ENV PATH /projects/node_modules/.bin:$PATH

RUN npm install
RUN npm install react-scripts@3.0.1 -g

# start app
EXPOSE 3000
CMD ["npm", "start"]
