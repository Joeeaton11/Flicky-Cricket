import subprocess, numpy as np, sys
def env(f,sr=8000,w=200):
    raw=subprocess.run(['ffmpeg','-loglevel','error','-i',f,'-ac','1','-ar',str(sr),'-f','s16le','-'],capture_output=True).stdout
    a=np.frombuffer(raw,np.int16).astype(float)
    e=np.array([np.sqrt(np.mean(a[i:i+w]**2)) for i in range(0,len(a)-w,w)]); return e, w/sr
def best_start(f,T,length):
    e,dt=env(f); sm=np.convolve(e,np.ones(5)/5,'same')
    # onset strength: energy after (0.4s) vs before (1s)
    k1,k2=int(0.4/dt),int(1.0/dt); best=(-1,0)
    for i in range(k2,len(e)-k1):
        start=i*dt-T
        if start<0 or start+length>len(e)*dt: continue
        after=sm[i:i+k1].mean(); before=sm[i-k2:i].mean()+1
        s=after/before*(after/sm.max())
        if s>best[0]: best=(s,start)
    return best
if __name__=='__main__':
    print(best_start(sys.argv[1],float(sys.argv[2]),float(sys.argv[3])))
