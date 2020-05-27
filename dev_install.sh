cwd=$(pwd)
source dev.env

if [[ -z "${MARKDOWN_EDITOR_ROOT}" ]]; then
  echo "MARKDOWN_EDITOR_ROOT is not set. Please set it in dev.env"
  exit 1
fi

if [[ -z "${YADA_ROOT}" ]]; then
  echo "YADA_ROOT is not set. Please set it in dev.env"
  exit 1
fi

# remove existing `dist`
rm -rf "$YADA_ROOT"/node_modules/rich-markdown-editor/dist

# build local version of rich-markdown-editor
cd "$MARKDOWN_EDITOR_ROOT"
npm i;

# copy distribution to node_modules
cp -r dist "$YADA_ROOT"/node_modules/rich-markdown-editor/

cd "$cwd"
