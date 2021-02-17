#!/usr/local/bin/python3
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

DEV = True
browser = webdriver.Chrome()
browser.get("http://localhost:3000/" if DEV else "https://yada.dev")

def update_token(browser, token):
    browser.add_cookie({"name": "access_token", "value": token})
    browser.refresh()

def change_propagation(browser):
    # Type in "/Tiredness" then call this method
    wait = WebDriverWait(browser, 10)

    save = browser.find_element_by_name("save_btn")
    save.click()

    # Click `fatigue and relaxation` view
    save_progress_bar = browser.find_element_by_name("save_progress")
    wait.until(EC.invisibility_of_element(save_progress_bar))

    view = browser.find_element_by_name("305728a0f84346f6a342dd0490a77c74")
    view.click()

    # Click `display mode`
    view_progress_bar = browser.find_element_by_name("view_progress")
    wait.until(EC.invisibility_of_element(view_progress_bar))

    display_mode = browser.find_element_by_name("checkedB")
    display_mode.click()
