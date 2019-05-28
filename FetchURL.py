#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup

def getUrl(searchString):
    resultUrl = 'https://www.youtube.com'
    urlSearchString = 'https://www.youtube.com/results?search_query=' + searchString.replace(' ', '+')
    req = requests.get(urlSearchString)
    soup = BeautifulSoup(req.content, 'html.parser')
    for link in soup.find_all('a'):
        if link.get('href').find('/watch') == 0:
            resultUrl += link.get('href')
            break

    return resultUrl

searchString = 'TELL ME OMER'
print(getUrl(searchString))
