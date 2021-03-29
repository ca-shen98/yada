#!/bin/bash

# Run tests from directory as it has related files necessary (eg. login credentials)
cd ./automation/integration_tests/

for filename in ./*test.js; do
    node $filename
done

# Return
cd -