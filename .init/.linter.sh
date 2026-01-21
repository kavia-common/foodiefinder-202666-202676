#!/bin/bash
cd /home/kavia/workspace/code-generation/foodiefinder-202666-202676/foodiefinder_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

