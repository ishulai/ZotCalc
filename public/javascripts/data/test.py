import re

s1 = "(I and III)"                     #{"and": ["I", "III"]}
s2 = "(I, III)"                        #{"and": ["I", "III"]}
s3 = "((I or II) and III)"             #{"and": [{"or": ["I", "II"]}, "III"]}
s4 = "(ART 20A or ART 30A or ART 40 or ART 51 or ART 65A or ART 71A or ART 81A or ART 91) and ART 9A"
s5 = "(ARTS 11 and ARTS 12 and ARTS 50 and ARTS 60) and proposal submission"
s6 = "(EARTHSS 51) or (EARTHSS 60A and EARTHSS 60C) or (BIO SCI E106)"
s7 = "(PSYCH 7A or PSY BEH 9) or (PSYCH 9A or PSY BEH 11A) and (PSYCH 9B or PSY BEH 11B)) or BIO SCI 35 or BIO SCI N110"

def parseGE(s):
	reg = re.compile("^\((.+)\)$")
	s = reg.match(s).groups()[0].split(" and ")
	b = []
	for a in s:
		if reg.match(a) != None:
			b.append(reg.match(a).groups()[0].split(" or "))
		else:
			b.append(a)
	return b

print parseGE(s3)