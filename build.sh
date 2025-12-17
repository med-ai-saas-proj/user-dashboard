#! /bin/sh
DOCKER_BUILDKIT=1 docker build --target export-stage --output type=local,dest=./build-output .
