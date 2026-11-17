import subprocess, sys
from align import best_start
V='/home/claude/fc/site/s/'
jobs=[('w1-rate-this-shot','hype.mp3',2.3),('w1-three-sixes','three.mp3',2.2),('w1-gully-hinglish','dhol.mp3',2.57)]
for name,track,T in jobs:
    vid=V+name+'.mp4'; dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',vid]))
    body=dur-1.8; _,st=best_start(track,T,body)
    fc=(f"[1:a]atrim=start={st:.3f}:duration={body:.3f},asetpts=PTS-STARTPTS,afade=t=in:st=0:d=0.15,afade=t=out:st={body-0.35:.3f}:d=0.35,volume=0.9[m];"
        f"[2:a]atrim=0:1.8,asetpts=PTS-STARTPTS,afade=t=out:st=1.4:d=0.4,adelay={int(body*1000)}|{int(body*1000)}[l];"
        f"[m][l]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]")
    out='/home/claude/posts/audio/'+name+'_sound.mp4'
    subprocess.run(['ffmpeg','-loglevel','error','-y','-i',vid,'-i',track,'-i','logo.mp3','-filter_complex',fc,'-map','0:v','-map','[a]','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-shortest','-movflags','+faststart',out],check=True)
    print(name,'music from',round(st,2),'s, body',round(body,2))
