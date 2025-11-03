# Assignment 2 - Sensor Data Collection
Author Jamie Flanagan - 21363664

# Overview:
Simple React web app that collects GPS data from a user's device using the Browsers Geolocation API
Records latitude, longitude, accuracy and a timestamp every 1.5 seconds

# Hosted Access (Recommended): Collect data not on same network
https://urbangpslog.netlify.app/

# Steps:
1. Open link on device
2. Allow location access when prompted
3. Click Start logging
4. Click stop logging
5. Download CSV
6. IOS downloads need to be open in preview before saving which is the expected behaviour, on a laptop the download happens straight away

# LocalHost version:
1. Install npm:
2. Run npm install for dependencies
3. run npm start
4. Open browser and go to http://localhost:3000
5. Allow location access and follow same steps as above

# Output:
Data is outputted as a CSV with:
timestamp, latitude, longitude and accuracy
