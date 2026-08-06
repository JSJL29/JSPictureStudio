#!/usr/bin/env bash
set -Eeuo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./Toolbox/add-photos.sh COLLECTION [IMPORT_FOLDER]

Examples:
  ./Toolbox/add-photos.sh Landscape
  ./Toolbox/add-photos.sh roadTrip/AddoPark
  ./Toolbox/add-photos.sh Krug/Kruger /c/Users/me/Desktop/new-photos

If IMPORT_FOLDER is omitted, photos are read from imports/COLLECTION.
EOF
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 2
fi

COLLECTION="${1//\\//}"
COLLECTION="${COLLECTION#/}"
COLLECTION="${COLLECTION%/}"

case "$COLLECTION" in
  Animal|Landscape|roadTrip/FermeAutruche|roadTrip/AddoPark|roadTrip/Tsitsikamma|roadTrip/Random|Krug/Kruger|Krug/ReptileCenter|Krug/RehabCenter|Krug/BourkesLuck) ;;
  *)
    echo "Collection inconnue : $COLLECTION" >&2
    echo "Consulte ./Toolbox/add-photos.sh sans argument pour voir les exemples." >&2
    exit 2
    ;;
esac

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"
IMPORT_DIR="${2:-$REPO_ROOT/imports/$COLLECTION}"
ORIGINALS_WORKTREE="$(cd -- "$REPO_ROOT/.." && pwd)/JSPictureStudio-originals"

command -v git >/dev/null || { echo "git est introuvable." >&2; exit 1; }
command -v python >/dev/null || { echo "python est introuvable." >&2; exit 1; }

cd "$REPO_ROOT"

if [[ "$(git branch --show-current)" != "main" ]]; then
  echo "Le dépôt principal doit être sur la branche main." >&2
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Le dépôt main contient déjà des modifications. Commit ou stash avant l'import." >&2
  exit 1
fi
if [[ ! -d "$IMPORT_DIR" ]]; then
  echo "Dossier introuvable : $IMPORT_DIR" >&2
  exit 1
fi

shopt -s nullglob nocaseglob
JPG_FILES=("$IMPORT_DIR"/*.jpg "$IMPORT_DIR"/*.jpeg)
shopt -u nocaseglob
if (( ${#JPG_FILES[@]} == 0 )); then
  echo "Aucun fichier JPG/JPEG dans : $IMPORT_DIR" >&2
  exit 1
fi

if [[ ! -e "$ORIGINALS_WORKTREE/.git" ]]; then
  if [[ -e "$ORIGINALS_WORKTREE" ]]; then
    echo "Le chemin existe mais n'est pas un worktree Git : $ORIGINALS_WORKTREE" >&2
    exit 1
  fi
  echo "Création du worktree originals…"
  git worktree add "$ORIGINALS_WORKTREE" originals
fi

if [[ "$(git -C "$ORIGINALS_WORKTREE" branch --show-current)" != "originals" ]]; then
  echo "Le worktree secondaire n'est pas sur la branche originals." >&2
  exit 1
fi
if [[ -n "$(git -C "$ORIGINALS_WORKTREE" status --porcelain)" ]]; then
  echo "Le worktree originals contient déjà des modifications." >&2
  exit 1
fi

echo "Import de ${#JPG_FILES[@]} photo(s) dans $COLLECTION…"
python "$SCRIPT_DIR/build_images.py" \
  --import-dir "$IMPORT_DIR" \
  --collection "$COLLECTION" \
  --originals-root "$ORIGINALS_WORKTREE"

echo "Publication des JPG originaux…"
git -C "$ORIGINALS_WORKTREE" add -- "img/$COLLECTION/en_jpg"
if ! git -C "$ORIGINALS_WORKTREE" diff --cached --quiet; then
  git -C "$ORIGINALS_WORKTREE" commit -m "Add originals to $COLLECTION"
  git -C "$ORIGINALS_WORKTREE" push origin originals
else
  echo "Les originaux étaient déjà à jour."
fi

echo "Publication des variantes optimisées…"
git add -- "img/generated/$COLLECTION" photo-manifest.js
if ! git diff --cached --quiet; then
  git commit -m "Add optimized photos to $COLLECTION"
  git push origin main
else
  echo "Les variantes étaient déjà à jour."
fi

echo
echo "Terminé : ${#JPG_FILES[@]} photo(s) ajoutée(s) à $COLLECTION."
echo "Les fichiers déposés restent dans $IMPORT_DIR et peuvent être archivés ou supprimés manuellement."
