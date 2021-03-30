#!/bin/bash

# Run tests from directory as it has related files necessary (eg. login credentials)
cd ./automation/integration_tests/

for filename in ./*test.js; do
    node $filename
    sleep 10 # Needed due to authentication being blocked when run back to back
done

# Return
cd -