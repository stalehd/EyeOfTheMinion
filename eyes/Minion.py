from flask import Flask, redirect, request
from flask import json
import hardware
import os

app = Flask(__name__, static_folder='html')

@app.route("/")
def index():
    return redirect('/html/index.html');

@app.route("/api")
def api_template():
    return json.jsonify(
        states='/api/state',
        look='/api/look',
        meters='/api/meters/[12345]',
        stfu='/api/stfu',
        blinkenlicht='/api/blinkenlicht/[123]')


@app.route('/api/state', methods=['GET', 'POST'])
def state():
    print request.form
    sound = request.form['state']
    os.system('play html/sounds/' + command + '.aiff')
    return json.jsonify(implemented='nopes')

@app.route('/api/look', methods=['GET', 'PUT'])
def look():
    return json.jsonify(implemented='nopes')


@app.route('/api/meters/<int:meter_id>', methods=['GET', 'PUT'])
def meter(meter_id):
    if request.method == 'GET':
        meter_value = hardware.get_meter_value(meter_id)
        if not meter_value:
            return json.jsonify(error = 'Could not read meter value'), 503

        return json.jsonify(meter_id = meter_id, value=meter_value)

    if request.method == 'PUT':
        meter_value = request.form['value']
        hardware.set_meter_value(meter_id, meter_value)
        return json.jsonify(meter_id = meter_id, value=meter_value)

    return json.jsonify(response='Bad request'), 400


@app.route('/api/stfu', methods=['PUT'])
def stfu():
    return json.jsonify(implemented='nopes')


@app.route('/api/blinkenlicht/<int:licht_id>', methods=['GET', 'PUT'])
def blinkenlicht(licht_id):
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

@app.route('/mcp/')
def minion_control_panel():
    return redirect('html/mcp/index.html')
    

if __name__ == "__main__":
    app.run(host='0.0.0.0',debug=True)
