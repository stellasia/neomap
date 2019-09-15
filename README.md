# neo-map

A Neo4j Desktop application to visualize nodes with geographic attributes on a map.


## Using docker

Build the docker image:

     docker build -t neomap .

Create a docker instance:

    docker run -p 3000:3000 neomap:latest

And navigate to [localhost:3000](localhost:3000).