# Writes const H={file:hash} into sw.js for every file in FILES, so an update downloads only the files that changed.
# Run after every change, before pushing:  python3 tools/sw_hash.py
import re,json,hashlib,os
os.chdir(os.path.join(os.path.dirname(__file__),'..'))
s=open('sw.js').read()
F=json.loads(re.search(r'const FILES=(\[.*?\]);',s,re.S).group(1))
H={f:hashlib.sha1(open(f,'rb').read()).hexdigest()[:10] for f in F}
line='const H='+json.dumps(H,separators=(',',':'))+';'
s=re.sub(r'const H=\{.*?\};',line,s,flags=re.S) if 'const H={' in s else s.replace('\nself.addEventListener(\'install\'','\n'+line+'\nself.addEventListener(\'install\'',1)
open('sw.js','w').write(s);print(len(H),'files hashed')
