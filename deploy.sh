#! /bin/bash

npm install -g serverless
npm install -g serverless-offline
serverless deploy --stage $env --package \   $CODEBUILD_SRC_DIR/target/$env -v -r us-east-1