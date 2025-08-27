#!/usr/bin/env python3

import selenium.webdriver
import time

chrome_options = selenium.webdriver.chrome.options.Options()
chrome_options.add_argument("--disable-extensions")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--headless=new") # for Chrome >= 109
chrome_options.add_argument("--headless")
chrome_options.headless = True # also works

chrome_options.add_argument("--window-size=1920,1080")

driver = selenium.webdriver.Chrome(options=chrome_options)

start_url = "http://localhost:8080"
driver.get(start_url)

driver.save_screenshot('login.png')

username_field = driver.find_element(selenium.webdriver.common.by.By.ID, "email")
username_field.send_keys("course-admin@test.edulinq.org")

pass_field = driver.find_element(selenium.webdriver.common.by.By.ID, "cleartext")
pass_field.send_keys("course-admin")

submit_button = driver.find_element(selenium.webdriver.common.by.By.CLASS_NAME, "template-button")
submit_button.click()

time.sleep(3)
driver.save_screenshot('home.png')

testCases = [
    ('#courses', 'courses'),
    ('#server', 'server'),
]

for testCase in testCases:
    driver.get("%s%s" % (start_url, testCase[0]))
    time.sleep(3)
    driver.save_screenshot('%s.png' % (testCase[1]))

driver.quit()
