#!/usr/local/bin/python3
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from time import sleep

browser = webdriver.Chrome()
wait = WebDriverWait(browser, 10)
def __goto_yada(browser):
    browser.get("http://yada.dev/")
    sleep(2)

def update_token(browser, token):
    browser.add_cookie({"name": "access_token", "value": token})
    browser.refresh()

def change_propagation(browser):
    __goto_yada(browser)
    sign_in = browser.find_element_by_xpath('//span[text()="Sign in with Google"]/../..')
    sign_in.click()

    # wait.until(EC.element_to_be_clickable(save_progress_bar))
    sleep(4)
    browser.switch_to.window(browser.window_handles[1])
    browser.find_element_by_xpath('//input[@type="email"]').send_keys("yada.bugs@gmail.com")
    browser.find_element_by_xpath('//*[@id="identifierNext"]').click()
    sleep(3)

    browser.find_element_by_xpath('//input[@type="password"]').send_keys("00")
    browser.find_element_by_xpath('//*[@id="passwordNext"]').click()
    sleep(2)
    # browser.get('https://youtube.com'​)
    # sleep(5)

    # passw=open('New Text Document (2).txt',"r",encoding="utf-8")   
    # password=str(passw.read())
    # user=open('New Text Document (3).txt',"r",encoding="utf-8")   
    # username=str(user.read())
    # mylike= Google(username,password)

change_propagation(browser)