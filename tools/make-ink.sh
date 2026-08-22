#!/usr/bin/env bash
# Turns the church's photographs into ink plates: two colour, error diffused,
# so they read as engravings printed on the page rather than as photographs.
#
#   bash tools/make-ink.sh
#
# Needs ffmpeg on PATH and the media-use dither script. Output lands in
# assets/img/ink/ as lossless WebP. Safe to re-run; it overwrites.
#
# The church's photographs were taken in a dim hall over about fifteen years,
# so their exposures are all over the place. A fixed gamma turned half of them
# into black rectangles. Each plate is therefore levelled to the same mean
# before dithering, which is what makes the set look like one printer's run.

set -euo pipefail

DITHER="${DITHER:-$HOME/.claude/skills/media-use/scripts/dither.mjs}"
SRC=assets/img
OUT=assets/img/ink
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

INK="#12151A"
PAPER="#F2F3F5"
TARGET=0.70      # mean luminance every plate is levelled towards, 0-1

SCENES="service-wide worship-1 worship-2 worship-team choir congregation congregation-seated
        building-1856 sanctuary pulpit preaching prayer white-garments
        stepup-distribution stepup-meals stepup-line stepup-bags
        mission-nigeria children-class children-grad gathering-1 gathering-2
        victory-life-tv pastor-felix-wide"

# Mean luminance of an image, 0-255, by squashing it to a single pixel.
mean() {
  ffmpeg -v error -y -i "$1" -vf "format=gray,scale=1:1" -f rawvideo -pix_fmt gray - \
    | od -An -tu1 | tr -d ' \n'
}

plate() { # src, dst, width, point-size
  local src=$1 dst=$2 w=$3 ps=$4
  [ -f "$src" ] || { echo "  skip (missing) $src"; return; }

  # Stretch each photograph to the full tonal range first. Doing the whole
  # correction with gamma alone, as this used to, blew the crowd shots out into
  # white paper with a few black holes in it: gamma lifts the midtones but
  # cannot pull a black point up, so anything shot in a dim hall needed a gamma
  # so violent it destroyed the midtones it was there to rescue. Levels first,
  # then only a gentle gamma to land on the target.
  ffmpeg -v error -y -i "$src" \
    -vf "scale='min($w,iw)':-1,format=gray,normalize=blackpt=black:whitept=white:smoothing=0" \
    "$TMP/gray.png"

  local m g
  m=$(mean "$TMP/gray.png")
  g=$(awk -v m="$m" -v t="$TARGET" 'BEGIN{
        n = m/255; if (n < 0.02) n = 0.02; if (n > 0.97) n = 0.97;
        g = log(n)/log(t);
        if (g < 0.85) g = 0.85; if (g > 2.2) g = 2.2;
        printf "%.3f", g }')

  ffmpeg -v error -y -i "$TMP/gray.png" -vf "eq=gamma=$g:contrast=1.0,unsharp=5:5:0.4" "$TMP/pre.png"
  node "$DITHER" --input "$TMP/pre.png" --out "$TMP/post.png" \
    -a floyd-steinberg --palette "$INK,$PAPER" --point-size "$ps" --contrast 1.15 >/dev/null
  ffmpeg -v error -y -i "$TMP/post.png" -c:v libwebp -lossless 1 -compression_level 6 "$dst"

  echo "  $(basename "$dst")  mean $m  gamma $g"
}

mkdir -p "$OUT/team"

# Wide plates. Coarser stipple, because a 1px stipple does not compress and a
# congregation on a phone should not cost 200 KB.
for n in $SCENES; do plate "$SRC/$n.webp" "$OUT/$n.webp" 1200 2; done

# Portraits get the fine stipple. They are small on screen and a face falls
# apart at point size 2.
for f in "$SRC"/team/*.webp; do
  plate "$f" "$OUT/team/$(basename "$f" .webp).webp" 520 1
done

# ---------------------------------------------------------------------------
# The two plates that are not conversions of a photograph.
# ---------------------------------------------------------------------------

# The drawn congregation and Toronto skyline. This one is already an engraving,
# so it is not dithered. It only gets its blacks lifted off pure black onto the
# site's blue-black ink, and its whites pushed to clean paper so that multiply
# drops them out of the page.
if [ -f "$SRC/congregation-skyline-src.jpg" ]; then
  ffmpeg -v error -y -i "$SRC/congregation-skyline-src.jpg" \
    -vf "curves=r='0/0.071 1/1':g='0/0.082 1/1':b='0/0.102 1/1',curves=all='0/0 0.86/0.99 1/1',eq=contrast=1.06,scale=1900:-1" \
    -c:v libwebp -q:v 88 "$OUT/congregation-skyline.webp"
  echo "  congregation-skyline.webp  (illustration, not dithered)"

  # The 2006 beat needs a picture of five people and there is no photograph of
  # five people, so it is cut out of the same drawing: Pastor Felix and the four
  # either side of him, full height, heads to feet. Five people at full height
  # is a squarish shape, which is why this plate is shown contained on the page
  # rather than bled across it like the others.
  ffmpeg -v error -y -i "$SRC/congregation-skyline-src.jpg" \
    -vf "crop=iw*0.30:ih*0.64:iw*0.355:ih*0.36,curves=r='0/0.071 1/1':g='0/0.082 1/1':b='0/0.102 1/1',curves=all='0/0 0.86/0.99 1/1',eq=contrast=1.06,scale=760:-1" \
    -c:v libwebp -q:v 90 "$OUT/five-2006.webp"
  echo "  five-2006.webp  (2006, cut from the illustration)"
fi

# The church logo, flattened to a single ink silhouette. Their logo is blue on
# transparent with white gridlines inside the globe, so this keys on luminance
# rather than alpha, which keeps those gridlines open.
INK_R=$((16#12)); INK_G=$((16#15)); INK_B=$((16#1A))
for pair in "logo.png:logo-ink.png" "monogram.png:monogram-ink.png"; do
  src="$SRC/${pair%%:*}"; dst="$OUT/${pair##*:}"
  [ -f "$src" ] || continue
  ffmpeg -v error -y -i "$src" -vf \
    "format=rgba,geq=r='$INK_R':g='$INK_G':b='$INK_B':a='if(gte(alpha(X,Y),120)*lt(0.299*r(X,Y)+0.587*g(X,Y)+0.114*b(X,Y),205),255,0)'" \
    "$dst"
  echo "  $(basename "$dst")  (logo silhouette)"
done

echo
echo "ink plates written to $OUT"
du -sh "$OUT"
