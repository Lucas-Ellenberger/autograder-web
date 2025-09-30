#!/usr/bin/env python3

import os
import selenium.webdriver
import sys

THIS_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
RESOURCES_DIR = os.path.abspath(os.path.join(THIS_DIR, '..', 'resources'))

def make_output_path(image_name, light_mode = True):
    mode_name = 'light'
    if (not light_mode):
        mode_name = 'dark'

    file_name = '%s-%s.png' % (image_name, mode_name)
    return os.path.join(RESOURCES_DIR, file_name)

def main():
    chrome_options = selenium.webdriver.chrome.options.Options()
    chrome_options.add_argument('--disable-extensions')
    chrome_options.add_argument('--disable-gpu')

    # This option is for Chrome >= 109.
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--headless')

    chrome_options.add_argument('--window-size=1920,1080')

    driver = selenium.webdriver.Chrome(options=chrome_options)

    start_url = 'http://localhost:8080'
    driver.get(start_url)

    bright_mode_toggle = selenium.webdriver.support.ui.WebDriverWait(driver, 10).until(
            selenium.webdriver.support.expected_conditions.presence_of_element_located((
                selenium.webdriver.common.by.By.CLASS_NAME, 'bright-mode-toggle'
            ))
        )

    driver.save_screenshot(make_output_path('login'))

    bright_mode_toggle.click()

    driver.save_screenshot(make_output_path('login', False))

    driver.quit()
    return 0

if __name__ == '__main__':
    sys.exit(main())
