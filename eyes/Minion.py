from flask import Flask, redirect, request
from flask import json
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
    return json.jsonify(implemented='nopes')


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
    

@app.route('/api/eye/pupil/<string:pupilsize>', methods=['PUT'])
def set_pupil(pupilsize):
    print 'Pupil set to ', pupilsize
    return json.jsonify(pupil=pupilsize)

@app.route('/api/eye/blinkspeed/<int:blinkspeed>', methods=['PUT'])
def set_blink(blinkspeed):
    print 'Blink set to ', blinkspeed
    #Blink once to signal change, keep rate unchanged
    return json.jsonify(blink=blinkspeed)

@app.route('/api/eye/blinkrate/<int:interval>', methods=['PUT'])
def set_blinkrate(interval):
    print 'Blink rate set to', interval
    # blink once to signal change, new rate
    return json.jsonify(rate=interval)

@app.route('/api/eye/mode/<string:mode>', methods=['PUT'])
def set_eye_mode(mode):
    print 'Eye mode set to', mode
    return json.jsonify(eyemode=mode)

if __name__ == "__main__":
    app.run(debug=True)
