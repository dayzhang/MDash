import os
import argparse
import json
# import selenium
# from selenium import webdriver
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.chrome.options import Options as ChromeOptions
# from selenium.webdriver.firefox.options import Options as FirefoxOptions
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support import expected_conditions as EC
# from fake_headers import Headers
# from webdriver_manager.chrome import ChromeDriverManager
# from webdriver_manager.firefox import GeckoDriverManager

# from webdriver_manager.chrome import ChromeDriverManager
# from fake_headers import Headers
from pynput.mouse import Button, Controller as MouseController
from pynput.keyboard import Key, Controller as KeyboardController
import time
import sys
import shutil

# collects music info for existing dashlet data
# assign directory

# ua = Headers().generate()

# options = webdriver.ChromeOptions()

# options.add_argument('--headless')
# options.add_argument('--disable-extensions')
# options.add_argument('--incognito')
# options.add_argument('--disable-gpu')
# options.add_argument(f'user-agent={ua}')
# options.add_argument('--disable-notifications')
# options.add_argument('--disable-popup-blocking')
# options.add_argument('--log-level=3')


# iterate over files in
# that directory
# driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)


directory = '../../abr-server/probability'
print(f"length: {len(os.listdir(directory))}")
# print(os.listdir(directory))
i = 0
mouse = MouseController()
keyboard = KeyboardController()
def typing(s, controller):
    for c in s:
        controller.press(c)
        time.sleep(0.05)
        controller.release(c)
    time.sleep(0.5)
def cmd(li, controller):
    for key in li:
        controller.press(key)
    time.sleep(0.2)
    for key in li:
        controller.release(key)
    time.sleep(0.5)

test_flag = False

if test_flag:
    cmd([Key.cmd, Key.space], keyboard)
    typing("google", keyboard)
    cmd([Key.enter], keyboard)
    time.sleep(2)
    cmd([Key.cmd, Key.ctrl, "f"], keyboard)
    time.sleep(1)
    url = "https://www.tiktok.com/@leslieturner88/video/6857081848766500097"
    mouse.position = (279.453125, 65.734375)
    mouse.press(Button.left)
    time.sleep(0.05)
    mouse.release(Button.left)
    mouse.press(Button.left)
    time.sleep(0.05)
    mouse.release(Button.left)
    cmd([Key.cmd, "a"], keyboard)
    cmd([Key.delete], keyboard)
    typing(url, keyboard)
    cmd([Key.enter], keyboard)
    time.sleep(2)

    mouse.position = (308.36328125, 880.6875) #890 for with one line, 890 w/ scroll -3 for 2 lines 
    time.sleep(0.25)
    # mouse.scroll(0, -3)
    time.sleep(0.5)
    mouse.press(Button.left)
    time.sleep(0.05)
    mouse.release(Button.left)
    mouse.press(Button.left)
    time.sleep(0.05)
    mouse.release(Button.left)

    time.sleep(2)
    exit()

cmd([Key.cmd, Key.space], keyboard)
typing("google", keyboard)
cmd([Key.enter], keyboard)
time.sleep(2)
cmd([Key.cmd, Key.ctrl, "f"], keyboard)
time.sleep(1)
for filename in os.listdir(directory):
    f = os.path.join(directory, filename)
    # checking if it is a file
    # print(f)
    if not os.path.isfile(f):
        continue
    fname = f.split("/")[-1]
    if len(fname) <= 15:
        continue
    print(fname)
    url = f"https://www.tiktok.com/@a/video/{fname[:-4]}"
    mouse.position = (279.453125, 65.734375)
    mouse.press(Button.left)
    time.sleep(0.05)
    mouse.release(Button.left)
    mouse.press(Button.left)
    time.sleep(0.05)
    mouse.release(Button.left)
    cmd([Key.cmd, "a"], keyboard)
    cmd([Key.delete], keyboard)
    typing(url, keyboard)
    cmd([Key.enter], keyboard)
    time.sleep(2)

    mouse.position = (308.36328125, 880.6875) 
    time.sleep(0.25)
    # mouse.scroll(0, -3)
    time.sleep(0.5)
    mouse.press(Button.left)
    time.sleep(0.05)
    mouse.release(Button.left)
    mouse.press(Button.left)
    time.sleep(0.05)
    mouse.release(Button.left)

    time.sleep(2)

    # finds an html a element with the relevant music href 
    # page = requests.get(url)
    # soup = BeautifulSoup(page.text, 'html.parser')
    # a_tag = soup.find("a", class_="epjbyn1")# 
    # music = a_tag["href"]
    # driver.get(url)
    # wait = WebDriverWait(driver, 10)
    # element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "epjbyn1")))    
    # a_tag = driver.find_element(By.CLASS_NAME, "epjbyn1")
    # music = a_tag.get_attribute("href")
    # print(music)
    # new_file_path = "dashlet_music_data" + music
    # if not os.path.exists(new_file_path): 
    #     os.makedirs(new_file_path) 
    # shutil.copyfile(f, new_file_path + fname)
    # print(i)
    # i += 1
# driver.quit()
cmd([Key.cmd, "w"], keyboard)