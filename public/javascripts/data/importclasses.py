# coding: utf-8

from bs4 import BeautifulSoup
import re
import json
import urllib2
import unidecode

reg = re.compile("^\((.+)\)\.?$")

def parseGE(s):
	s = s.replace(", ", " and ").split(" and ")
	b = []
	for a in s:
		if reg.match(a) != None:
			b.append(reg.match(a).groups()[0].split(" or "))
		else:
			b.append(a.strip())
	return b

page = urllib2.urlopen('http://catalogue.uci.edu/allcourses/').read()
soup1 = BeautifulSoup(page, 'html.parser')

classes = []

p1 = re.compile("^([a-zA-Z0-9&\s]+)\.\s+(.+)\.\s+(.+) Units\..*")
p2 = re.compile("Grading Option: (.+)\.\s*")
p3 = re.compile("Repeatability: (.+)\s*")
p4 = re.compile("Restriction: (.+)\s*")
p5 = re.compile("Prerequisite: (.+)\.\s*")
p6 = re.compile("Corequisite: (.+)\.\s*")
p7 = re.compile("Same as (.*)\.\s*")
p8 = re.compile("Overlaps with (.*)\.\s*")

pr = re.compile("May be taken for credit (\d+) times.*")

for li in soup1.find("div", {"id": "atozindex"}).find_all("li"):
	page2 = urllib2.urlopen("http://catalogue.uci.edu" + li.find("a")["href"]).read()
	soup = BeautifulSoup(page2, 'html.parser')
	for course in soup.find_all("div", {"class": "courseblock"}):
		cl = {}
		for content in course.find_all("p"):
			text = unidecode.unidecode(content.get_text())
			res1 = p1.match(text)
			res2 = p2.match(text)
			res3 = p3.match(text)
			res4 = p4.match(text)
			res5 = p5.match(text)
			res6 = p6.match(text)
			res7 = p7.match(text)
			res8 = p8.match(text)
			res9 = reg.match(text)
			if res1 != None:
				cl["course"] = res1.groups()[0].strip()
				cl["title"] = res1.groups()[1].strip()
				cl["units"] = res1.groups()[2].strip()
				print res1.groups()[0].strip()
			elif res2 != None:
				cl["grading"] = res2.groups()[0].strip()
			elif res3 != None:
				tmp = pr.match(res3.groups()[0].strip())
				if tmp != None:
					cl["repeat"] = tmp.groups()[0]
			elif res4 != None:
				cl["restriction"] = res4.groups()[0].strip()
			elif res5 != None:
				cl["prerequisite"] = res5.groups()[0].strip()
			elif res6 != None:
				cl["corequisite"] = res6.groups()[0].strip()
			elif res7 != None:
				cl["same"] = res7.groups()[0].strip().split(", ")
			elif res8 != None:
				cl["overlap"] = res8.groups()[0].strip().split(", ")
			elif res9 != None:
				cl["ge"] = parseGE(res9.groups()[0].strip())
			else:
				if content.get_text().strip() != "":
					cl["description"] = content.get_text().strip()
		classes.append(cl)


with open('classes.json', 'w') as fp:
    json.dump(classes, fp)