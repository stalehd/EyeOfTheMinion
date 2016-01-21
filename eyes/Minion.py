from flask import Flask
from flask import json

app = Flask(__name__, static_folder='html')

@app.route("/")
def index():
    return json.jsonify(static='html/index.html', api='api/')

@app.route("/api")
def api_template():
    return json.jsonify(
        states='/api/state',
        look='/api/look',
        meters='/api/meters/[12345]',
        stfu='/api/stfu',
        blinkenlicht='/api/blinkenlicht/[123]')


@app.route('/api/state', methods=['GET', 'PUT'])
def state():
    return json.jsonify(implemented='nopes')


@app.route('/api/look', methods=['GET', 'PUT'])
def look():
    return json.jsonify(implemented='nopes')


@app.route('/api/meters/<int:meter_id>', methods=['GET', 'PUT'])
def meter(meter_id):
    return json.jsonify(implemented='nopes')


@app.route('/api/stfu', methods=['PUT'])
def stfu():
    return json.jsonify(implemented='nopes')


@app.route('/api/blinkenlicht/<int:licht_id>', methods=['GET', 'PUT'])
def meter(licht_id):
    return json.jsonify(implemented='nopes')

#
# /api ->
#
# GET|PUT /api/state { "state": "giggle|normal|alert|banana|sleepy|babu" }
# GET|PUT /api/look { "direction": 0-360, "distance": 0-100 }
# GET|PUT /api/meters/[12345] { "value": 0-100 }
# PUT /api/stfu
# GET|PUT /api/blinkenlicht/[123] { "mode": "on|off" }
#


@app.route('/api/commands')
def list_commands():
    return json.jsonify(implemented='nopes')


@app.route('/api/commands/next')
def next_command_in_queue():
    return json.jsonify(implemented='nopes')


if __name__ == "__main__":
    app.run()
