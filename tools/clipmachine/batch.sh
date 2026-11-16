#!/bin/bash
# scene league pairs
for pair in "tg_gully 1" "tr_rooftop 1" "te_coliseum 2" "tc_beachnight 3" "tf_funfair 4" "ti_mumbai 9" "ta_mcg 6" "td_dubai 7"; do
  set -- $pair; out=/home/claude/clips/runs/$1
  rm -rf $out; mkdir -p $out
  sed -i "s#index.html?scene={scene}[^']*'#index.html?scene={scene}\&lg=$2'#" /home/claude/clips/rec3.py
  SECS=150 timeout 280 python3 /home/claude/clips/rec3.py $1 $out 2>&1 | tail -1
  python3 /home/claude/clips/build.py $out >/dev/null 2>&1 && rm -rf $out/frames && echo "built $1"
done
echo ALLDONE
