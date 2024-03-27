from pynput import mouse, keyboard
from pynput.keyboard import Key
import time
import json
import sys

n = len(sys.argv)

if n != 3:
    exit("Takes 2 arguments, number of seconds per iteration and number of iterations")

num_secs = int(float(sys.argv[1]))
num_runs = int(float(sys.argv[2]))
name_of_recording = f"{num_secs}secs"

print(num_runs)
storage = []
"""

keyb = keyboard.Controller()


def on_press(key):
    try:
        json_object = {'action':'pressed_key', 'key':key.char, '_time': time.time()}
    except AttributeError:
        if key == keyboard.Key.esc:
            return False
        json_object = {'action':'pressed_key', 'key':str(key), '_time': time.time()}
    storage.append(json_object)

def on_release(key):
    try:
        json_object = {'action':'released_key', 'key':key.char, '_time': time.time()}
    except AttributeError:
        json_object = {'action':'released_key', 'key':str(key), '_time': time.time()}
    storage.append(json_object)

keyboard_listener = keyboard.Listener(
    on_press=on_press,
    on_release=on_release)

keyboard_listener.start()
for i in range(num_runs):
    keyb.press(Key.space)
    keyb.release(Key.space)
    time.sleep(5)
keyb.press(Key.ctrl)
keyb.release(Key.ctrl)
with open('../app-handler/data/{}.txt'.format(name_of_recording), 'w') as outfile:
    json.dump(storage, outfile)
keyb.press(Key.esc)
keyboard_listener.join()
"""
start_time = time.time()

for i in range(num_runs):
    
    json_object = {'action':'pressed_key', 'key':"Key.space", '_time': start_time + num_secs * i}
    storage.append(json_object)
    json_object = {'action':'released_key', 'key':"Key.space", '_time': start_time + num_secs * i + 0.001}
    storage.append(json_object)
json_object = {'action':'pressed_key', 'key':"Key.ctrl", '_time': start_time + num_secs * num_runs}
storage.append(json_object)
json_object = {'action':'released_key', 'key':"Key.ctrl", '_time': start_time + num_secs * num_runs + 0.001}
storage.append(json_object)
with open('../app-handler/data/{}.txt'.format(name_of_recording), 'w') as outfile:
    json.dump(storage, outfile)