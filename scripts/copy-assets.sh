#!/bin/bash
# Copies and renames assets from ../Assets/ into app/assets/
# Run from the app/ directory: bash scripts/copy-assets.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
SOURCE_DIR="$(dirname "$APP_DIR")/Assets"

echo "Copying from: $SOURCE_DIR"
echo "Copying to:   $APP_DIR/assets"

# Background
cp "$SOURCE_DIR/background/B531E6EB-826A-434D-8965-83F3B9A8E827.PNG" \
   "$APP_DIR/assets/background/onsen-bg.png"
echo "✓ background/onsen-bg.png"

# Monkey poses — renamed to clean slug names
cp "$SOURCE_DIR/monkey actions/Calm monkey in ink style.png"                  "$APP_DIR/assets/monkey/calm.png"
cp "$SOURCE_DIR/monkey actions/Contemplative monkey in minimal ink style.png" "$APP_DIR/assets/monkey/contemplative.png"
cp "$SOURCE_DIR/monkey actions/Thoughtful cartoon monkey in ink style.png"    "$APP_DIR/assets/monkey/thoughtful.png"
cp "$SOURCE_DIR/monkey actions/Thoughtful cartoon monkey in ink style (1).png" "$APP_DIR/assets/monkey/thoughtful-alt.png"
cp "$SOURCE_DIR/monkey actions/Playful monkey in ink style.png"               "$APP_DIR/assets/monkey/playful.png"
cp "$SOURCE_DIR/monkey actions/Playful simplicity of a small monkey.png"      "$APP_DIR/assets/monkey/playful-simple.png"
cp "$SOURCE_DIR/monkey actions/Dancing monkey in ink brush style.png"         "$APP_DIR/assets/monkey/dancing.png"
cp "$SOURCE_DIR/monkey actions/Seated monkey in traditional ink style.png"    "$APP_DIR/assets/monkey/seated.png"
cp "$SOURCE_DIR/monkey actions/Serene monkey in minimalist ink style.png"     "$APP_DIR/assets/monkey/serene.png"
cp "$SOURCE_DIR/monkey actions/Peaceful monkey in ink style.png"              "$APP_DIR/assets/monkey/peaceful.png"
cp "$SOURCE_DIR/monkey actions/Minimalist ink painting of a monkey.png"       "$APP_DIR/assets/monkey/minimalist.png"
cp "$SOURCE_DIR/monkey actions/Monkey with pipe in minimalist style.png"      "$APP_DIR/assets/monkey/pipe.png"
cp "$SOURCE_DIR/monkey actions/Angry monkey with towel__endoftext__.png"      "$APP_DIR/assets/monkey/angry.png"
cp "$SOURCE_DIR/monkey actions/IMG_8819.JPG"                                  "$APP_DIR/assets/monkey/photo.jpg"

echo "✓ All monkey poses copied"
echo ""
echo "Assets ready. You still need to add:"
echo "  app/assets/audio/ambient.mp3   ← Japanese ambient music track"
echo "  app/assets/fonts/NotoSerifJP-Regular.otf  ← Japanese serif font"
