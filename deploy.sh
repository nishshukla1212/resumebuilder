#! /bin/bash

npm install -g serverless
serverless deploy $env --package \   $CODEBUILD_SRC_DIR/target/$env -v -r us-east-1