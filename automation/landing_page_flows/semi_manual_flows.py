#!/usr/local/bin/python3
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

browser = webdriver.Chrome()
browser.get("https://yada.dev")

#TODO: Manually go in and:
# - set the `access_token` (as Google OAuth blocks it from signing in)
# - add the `name` attribute for all elements mentioned below

def change_propagation(browser):
    # Type in "/Tiredness" then call this method
    wait = WebDriverWait(browser, 5)

    save = browser.find_element_by_name("save_btn")
    save.click()

    # Click `fatigue and relaxation` view
    save_progress_bar = browser.find_element_by_name("save_progress")
    wait.until(EC.invisibility_of_element(save_progress_bar))

    view = browser.find_element_by_name("view")
    view.click()

    # Click `display mode`
    view_progress_bar = browser.find_element_by_name("view_progress")
    wait.until(EC.invisibility_of_element(view_progress_bar))

    display_mode = browser.find_element_by_name("display")
    display_mode.click()
