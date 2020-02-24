#!/usr/bin/env bash

cd api/ && npm test && cd -
cd backend/function_process_check_request && npm test && cd -
cd backend/function_process_email_request && npm test && cd -
cd backend/function_process_web_request && npm test && cd -