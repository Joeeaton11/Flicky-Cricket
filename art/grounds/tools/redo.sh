# usage: redo.sh <dir> <key> <src_png> <node> <sky: top|match>
set -e; g=$1; key=$2; src=$3; node=$4; sky=$5
cd /home/claude/flicky-cricket/art/grounds/$g
n=1; while [ -f plate_v$n.png ]; do n=$((n+1)); done; cp plate.png plate_v$n.png
cp $src raw/plate_$node.png
python3 ../tools/fit_field.py raw/plate_$node.png | tail -1
python3 ../tools/fit_uniform.py raw/plate_$node.png > fit.log; tail -1 fit.log
python3 ../tools/measure_field.py plate.png | tail -1
U=$(grep -o 'uncovered top [0-9]*' fit.log | awk '{print $3}')
[ "${U:-0}" -gt 0 ] && python3 sky_$sky.py $U
python3 - <<P
from PIL import Image
im=Image.open('plate.png').convert('RGB'); im.save('../../../assets/themes/$key.webp',quality=86)
im.crop((0,120,1170,799)).resize((930,540),Image.LANCZOS).save('../../../assets/themes/$g/result.webp',quality=86)
P
