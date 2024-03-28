from pynput import mouse, keyboard
from pynput.keyboard import Key
import time
import json
import sys
import numpy as np

n = len(sys.argv)

if n != 3:
    exit("Takes 2 arguments, number of minutes in total and exponential factor")

num_min = float(sys.argv[1])
exponent_factor = float(sys.argv[2])

name_of_recording = f"exp_distr_{exponent_factor}{num_min}min"

print(num_min)
storage = []
start_time = time.time()
prev_time = start_time

while prev_time - start_time < num_min * 60:
    swipe_timing = np.random.exponential(exponent_factor)
    json_object = {'action':'pressed_key', 'key':"Key.space", '_time': prev_time}
    storage.append(json_object)
    json_object = {'action':'released_key', 'key':"Key.space", '_time': prev_time + 0.001}
    storage.append(json_object)
    prev_time += swipe_timing

json_object = {'action':'pressed_key', 'key':"Key.ctrl", '_time': prev_time}
storage.append(json_object)
json_object = {'action':'released_key', 'key':"Key.ctrl", '_time': prev_time + 0.001}
storage.append(json_object)
with open('../app-handler/data/{}.txt'.format(name_of_recording), 'w') as outfile:
    json.dump(storage, outfile)