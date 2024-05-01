import os
import argparse
import json
import selenium
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from fake_headers import Headers
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager

from webdriver_manager.chrome import ChromeDriverManager
from fake_headers import Headers

import shutil
# assign directory

ua = Headers().generate()

options = webdriver.ChromeOptions()

options.add_argument('--headless')
options.add_argument('--disable-extensions')
options.add_argument('--incognito')
options.add_argument('--disable-gpu')
options.add_argument(f'user-agent={ua}')
options.add_argument('--disable-notifications')
options.add_argument('--disable-popup-blocking')
options.add_argument('--log-level=3')


# iterate over files in
# that directory
driver = webdriver.Chrome(ChromeDriverManager().install(), options=options)
print("driver installed")

directory = '../../abr-server/probability'
print(f"length: {len(os.listdir(directory))}")
print(os.listdir(directory))
i = 0

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
    
    
    # finds an html a element with the relevant music href 
    # page = requests.get(url)
    # soup = BeautifulSoup(page.text, 'html.parser')
    # a_tag = soup.find("a", class_="epjbyn1")# 
    # music = a_tag["href"]
    driver.get(url)
    wait = WebDriverWait(driver, 10)
    element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "epjbyn1")))    
    a_tag = driver.find_element(By.CLASS_NAME, "epjbyn1")
    music = a_tag.get_attribute("href")
    print(music)
    new_file_path = "dashlet_music_data" + music
    if not os.path.exists(new_file_path): 
        os.makedirs(new_file_path) 
    shutil.copyfile(f, new_file_path + fname)
    print(i)
    i += 1
driver.quit()