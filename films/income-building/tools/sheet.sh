#!/bin/sh
# Render stills at given seconds (FilmPreview, 30 fps) and tile them into out/sheet.png
cd "$(dirname "$0")/.." || exit 1
list=""
for s in "$@"; do
  f=$(python3 -c "print(round($s*30))")
  tools/cloud.sh still src/index.ts FilmPreview out/s_$s.png --frame=$f --scale=0.5 >/dev/null 2>&1 || echo "fail $s"
  list="$list -i out/s_$s.png"
done
n=$#
ffmpeg -y -loglevel error $list -filter_complex "$(python3 -c "
n=$n
ins=''.join(f'[{i}]' for i in range(n))
cols=3
lay='|'.join(f'{(i%cols)*960}_{(i//cols)*540}' for i in range(n))
print(f'{ins}xstack=inputs={n}:layout={lay}:fill=black')
")" out/sheet.png
