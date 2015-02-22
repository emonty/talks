#!/bin/bash

rsync -avz --exclude=.git . scylla.inaugust.com:/usr/local/quoins-tg2.1-env/inaugust/inaugust/public/talks
