#!/usr/bin/env bash

cd api/ && npm i && cp .env.dist .env && cd -
cd backend/function_process_check_request && npm i && cp -f .env.dist .env && cd -
cd backend/function_process_email_request && npm i && cp -f .env.dist .env && cd -
cd backend/function_process_web_request && npm i && cp -f .env.dist .env && cd -