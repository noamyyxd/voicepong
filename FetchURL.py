#!/usr/bin/env python
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import sys

searchString = sys.argv[0];
resultUrl = 'https://www.youtube.com'
urlSearchString = 'https://www.youtube.com/results?search_query=' + searchString.replace(' ', '+')
req = requests.get(urlSearchString)
soup = BeautifulSoup(req.content, 'html.parser')
for link in soup.find_all('a'):
	if link.get('href').find('/watch') == 0:
		resultUrl += link.get('href')
		break

print(resultUrl)
