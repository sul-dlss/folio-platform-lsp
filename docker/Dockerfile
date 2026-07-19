FROM node:18-alpine AS stripes_build

# Set build arguments with default values
ARG OKAPI_URL=https://folio-prod-api.stanford.edu
ARG TENANT_ID=sul
ARG BUILD_ARGS="--okapi $OKAPI_URL --tenant $TENANT_ID"
ARG REGISTRY=folio
ARG CXXFLAGS="-std=c++17"

# Define the home directory for Stripes
ENV STRIPES_HOME=/etc/folio/stripes

RUN mkdir -p $STRIPES_HOME

COPY . $STRIPES_HOME/

WORKDIR $STRIPES_HOME

# Install dependencies and build the application
RUN apk upgrade --no-cache && \
    apk add --no-cache alpine-sdk python3 && \
    yarn config set python /usr/bin/python3 && \
    yarn config set @folio:registry https://repository.folio.org/repository/npm-$REGISTRY/ && \
    yarn install && \
    yarn build-module-descriptors

COPY tenant-assets/MainNav.css node_modules/@folio/stripes-core/src/components/MainNav
COPY tenant-assets/Pane.css node_modules/@folio/stripes-components/lib/Pane
RUN yarn build output $BUILD_ARGS

FROM nginx:stable-alpine

# Define the home directory for Stripes
ENV STRIPES_HOME=/etc/folio/stripes

# Install latest patch versions of packages: https://pythonspeed.com/articles/security-updates-in-docker/
RUN apk upgrade --no-cache

# Expose port 80 for nginx
EXPOSE 80

# Copy built files from the stripes_build stage
COPY --from=stripes_build $STRIPES_HOME/output /usr/share/nginx/html
COPY --from=stripes_build $STRIPES_HOME/yarn.lock /usr/share/nginx/html/yarn.lock

# Configure nginx and entrypoint
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /usr/bin/entrypoint.sh
RUN mkdir /usr/share/nginx/html/sul
COPY tenant-assets/logo.png /usr/share/nginx/html/sul/logo.png

ENTRYPOINT ["/usr/bin/entrypoint.sh"]
