#!/bin/bash

# Install git commit hooks - run this after cloning

for f in hooks/* ; do
    ln -s ../../$f .git/hooks
done
