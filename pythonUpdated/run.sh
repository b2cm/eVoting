#!/bin/bash

python3 -v -m venv venv
source venv/bin/activate

pip install -r requirements.txt

python3 -m server

deactivate

