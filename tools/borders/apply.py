import json,re,sys
n=sys.argv[1]
v=json.load(open('/tmp/v22/code%s.json'%n)); p='/home/claude/flicky-cricket/www/assets/v22.js'; s=open(p).read()
m=re.search(r"FRAMES = new Set\(\[([0-9, ]*)\]\)",s); fr=[int(x) for x in m.group(1).split(',') if x.strip()]
if int(n) not in fr: fr.append(int(n)); s=s.replace(m.group(0),"FRAMES = new Set([%s])"%", ".join(map(str,fr)))
val="%s: [%s, %s, %s]"%(n,v['fr1'],v['fr2'],v.get('fe',0))
if re.search(r"\b%s: \[[0-9., ]+\]"%n,s): s=re.sub(r"\b%s: \[[0-9., ]+\]"%n,val,s,count=1)
else: s=s.replace("FDIM = {","FDIM = { "+val+",",1)
rule='.tcard.pt.tf[data-lg="%s"]{--hl:%s;--hr:%s;--ht:%s;--hb:%s}'%(n,v['hl'],v['hr'],v['ht'],v['hb'])
if re.search(r'\.tcard\.pt\.tf\[data-lg="%s"\]\{--hl:[^}]*\}'%n,s): s=re.sub(r'\.tcard\.pt\.tf\[data-lg="%s"\]\{--hl:[^}]*\}'%n,rule,s)
else: s=s.replace('.tcard.pt.tf::after{',rule+'.tcard.pt.tf::after{',1)
open(p,'w').write(s); print('applied',n)
