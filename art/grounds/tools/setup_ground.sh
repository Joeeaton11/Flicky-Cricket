# usage: setup_ground.sh <dir> <key> <plate_blob> <node> <sky top|match> <hud_blob> <props_blob> <words_blob>
set -e; T=/root/.claude/projects/-home-claude/49f541fb-6c5a-5087-bd86-0b1c3066478f/tool-results
cd /home/claude/flicky-cricket/art/grounds; g=$1; key=$2
mkdir -p $g/raw ../../assets/themes/$g; cp hagley/{fit_grass.py,measure.py,sky_top.py,sky_match.py} $g/
cp $T/$6.png $g/raw/hud.png; cp $T/$7.png $g/raw/props.png; cp $T/$8.png $g/raw/words.png; cp $T/$3.png $g/raw/plate_$4.png
cd $g; python3 fit_grass.py raw/plate_$4.png|tail -1; python3 ../tools/fit_uniform.py raw/plate_$4.png > fit.log; tail -1 fit.log; python3 measure.py plate.png | tail -1
U=$(grep -o 'uncovered top [0-9]*' fit.log | awk '{print $3}'); [ "${U:-0}" -gt 0 ] && python3 sky_$5.py $U >/dev/null
python3 -c "
from PIL import Image
im=Image.open('plate.png').convert('RGB'); im.save('../../../assets/themes/$key.webp',quality=86)
im.crop((0,120,1170,799)).resize((930,540),Image.LANCZOS).save('../../../assets/themes/$g/result.webp',quality=86)"
