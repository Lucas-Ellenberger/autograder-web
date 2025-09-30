#!/usr/bin/env python3

import os
import requests
import selenium.webdriver
import sys
import time

THIS_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
RESOURCES_DIR = os.path.abspath(os.path.join(THIS_DIR, '..', 'resources'))

DEFAULT_SITE = 'http://localhost'
DEFAULT_PORT = 8080
DEFAULT_START_URL = '%s:%s' % (DEFAULT_SITE, DEFAULT_PORT)

DEFAULT_REQUEST_RETRIES = 10
DEFAULT_REQUEST_TIMEOUT = 2
DEFAULT_REQUEST_SLEEP_TIME = 3

def make_output_path(image_name, light_mode = True):
    mode_name = 'light'
    if (not light_mode):
        mode_name = 'dark'

    file_name = '%s-%s.png' % (image_name, mode_name)
    return os.path.join(RESOURCES_DIR, file_name)

def wait_for_server_start(start_url = DEFAULT_START_URL, num_retries = DEFAULT_REQUEST_RETRIES, request_timeout = DEFAULT_REQUEST_TIMEOUT, sleep_time = DEFAULT_REQUEST_SLEEP_TIME):
    for _ in range(num_retries):
        try:
            response = requests.get(start_url, timeout = request_timeout)
            if response.status_code == 200:
                print("Server is up!")
                return
        except requests.exceptions.RequestException:
            pass

        print("Waiting for server...")
        time.sleep(sleep_time)

    # Server failed to start.
    raise RuntimeError("Server did not start in time.")

def main():
    chrome_options = selenium.webdriver.chrome.options.Options()
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-gpu')

    # This option is for Chrome >= 109.
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--headless')

    chrome_options.add_argument('--window-size=1920,1080')

    driver = selenium.webdriver.Chrome(options=chrome_options)

    wait_for_server_start()

    driver.get(DEFAULT_START_URL)
    driver.implicitly_wait(2)

    driver.save_screenshot(make_output_path('login'))

    bright_mode_toggle = driver.find_element(selenium.webdriver.common.by.By.CLASS_NAME, 'bright-mode-toggle')
    bright_mode_toggle.click()
    driver.implicitly_wait(2)

    driver.save_screenshot(make_output_path('login', False))

    driver.quit()
    return 0

if __name__ == '__main__':
    sys.exit(main())
