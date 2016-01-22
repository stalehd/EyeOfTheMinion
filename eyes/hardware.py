import os
import serial

port = serial.Serial("/dev/ttyACM0", baudrate=9600, timeout=1.0)

def serial_request(request):
    port.write("%s\n" % request)
    responses = []
    while True:
        line = port.readline()
        # Timeout
        if not line:
            break
        response_code, message = line[0:3], line[4:].strip()
        # Success!
        if response_code in ('200','201'):
            break
        responses.append((response_code, message))
    return responses


def get_meter_value(meter_id):
    for response_code, message in serial_request('s'):
        if response_code == "102":
            id, value = message.split(":")
            if meter_id == int(id):
                return value
    return False


def set_meter_value(meter_id, value):
    return serial_request("%s %s" % (meter_id, value))
