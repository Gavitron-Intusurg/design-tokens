#!/bin/bash
# Single command to develop tokens with live reload across React and QML.
# Usage: npm run watch

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
REACT_APP="${REACT_APP:-$HOME/Desktop/test-react-app}"
QML_APP="${QML_APP:-$HOME/Desktop/test-qml-app}"
QML_MAIN="$QML_APP/main.qml"
PKG_PATH="node_modules/@gavitron-intusurg/design-system"

# PID file to track QML process (avoids pipe-subshell variable scoping issue)
PID_FILE=$(mktemp /tmp/watch-qml-pid.XXXXXX)
BSYNC_PID=""

cleanup() {
  echo ""
  echo "Shutting down..."
  if [ -f "$PID_FILE" ]; then
    QML_PID=$(cat "$PID_FILE")
    [ -n "$QML_PID" ] && kill "$QML_PID" 2>/dev/null && echo "  Stopped QML app"
    rm -f "$PID_FILE"
  fi
  [ -n "$BSYNC_PID" ] && kill "$BSYNC_PID" 2>/dev/null && echo "  Stopped browser-sync"
  exit 0
}
trap cleanup EXIT INT TERM

start_qml() {
  if [ -f "$QML_MAIN" ]; then
    OLD_PID=$(cat "$PID_FILE" 2>/dev/null)
    [ -n "$OLD_PID" ] && kill "$OLD_PID" 2>/dev/null && wait "$OLD_PID" 2>/dev/null
    qml "$QML_MAIN" &
    echo $! > "$PID_FILE"
    echo "  ✓ QML app started (PID $!)"
  fi
}

# Start browser-sync for React app
if [ -d "$REACT_APP" ]; then
  cd "$REACT_APP"
  npx browser-sync start --server \
    --files "$PKG_PATH/build/react/tokens.css" \
    --files "index.html" \
    --no-open --port 3000 --no-notify &
  BSYNC_PID=$!
  echo "✓ React app: browser-sync on http://localhost:3000 (PID $BSYNC_PID)"
fi

start_qml

echo ""
echo "Watching tokens/ for changes... (Ctrl+C to stop everything)"
echo ""

cd "$PROJECT_DIR"
fswatch -o -l 0.5 "$PROJECT_DIR/tokens/" | while read; do
  echo "$(date '+%H:%M:%S') Token change detected — rebuilding..."

  if ! (cd "$PROJECT_DIR" && npm run build --silent 2>&1); then
    echo "  ✗ Build failed — skipping copy"
    continue
  fi

  # Copy to both apps in parallel
  (
    if [ -d "$REACT_APP/$PKG_PATH" ]; then
      cp -r "$PROJECT_DIR/build/react/." "$REACT_APP/$PKG_PATH/build/react/"
      echo "  ✓ React app updated (browser-sync will reload)"
    fi
  ) &
  (
    if [ -d "$QML_APP/$PKG_PATH" ]; then
      cp -r "$PROJECT_DIR/build/qml/." "$QML_APP/$PKG_PATH/build/qml/"
      echo "  ✓ QML app files updated"
    fi
  ) &
  wait

  start_qml

  echo "  Done."
  echo ""
done
