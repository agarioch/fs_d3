import sys
import datetime
import json
import requests

API_KEY = "fZuayDZqd23uQoljxIbnBJjUvNVU4HtU"
lat = 51.5074
lon = 0.1278

data = []

url = "https://api.climacell.co/v3/weather/forecast/hourly"
max_days_back = 3
end_date = datetime.datetime.today() + datetime.timedelta(days=(max_days_back + 1))
end_date_string = end_date.isoformat()

querystring = {
    "lat": lat,
    "lon": lon,
    "unit_system": "si",
    "start_time": "now",
    "end_time": end_date_string,
    "fields": "temp",
    "apikey": API_KEY}

response = requests.request("GET", url, params=querystring)
json_data = json.loads(response.text)

data_file = open('london_forecast.json', 'w')
data_file.seek(0)
data_file.truncate()
data_file.write(json.dumps(json_data))
