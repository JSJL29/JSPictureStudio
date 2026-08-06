"""Generate responsive assets and update the JSPictureStudio manifest.

Normal usage is through Toolbox/add-photos.sh. The legacy mode remains
available for rebuilding photos when JPG and source WebP files are colocated.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image, ImageOps, ImageStat


ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOT = ROOT / "img"
GENERATED_ROOT = IMAGE_ROOT / "generated"
MANIFEST_PATH = ROOT / "photo-manifest.js"
WIDTHS = (640, 1280, 2560)
QUALITY = {640: 68, 1280: 74, 2560: 80}
VALID_COLLECTIONS = {
    "Animal",
    "Landscape",
    "roadTrip/FermeAutruche",
    "roadTrip/AddoPark",
    "roadTrip/Tsitsikamma",
    "roadTrip/Random",
    "Krug/Kruger",
    "Krug/ReptileCenter",
    "Krug/RehabCenter",
    "Krug/BourkesLuck",
}
DOWNLOAD_ROOT = (
    "https://raw.githubusercontent.com/JSJL29/"
    "JSPictureStudio/originals/"
)


def source_jpg_for(webp: Path) -> Path:
    return webp.parent / "en_jpg" / f"{webp.stem}.jpg"


def category_for(relative: Path) -> str:
    parts = relative.parts
    return parts[0] if parts[0] in {"Animal", "Landscape"} else parts[1]


def collection_for(relative: Path) -> str:
    parts = relative.parts
    if parts[0] in {"Animal", "Landscape"}:
        return "home"
    return "roadtrip" if parts[0] == "roadTrip" else "kruger"


def dominant_color(image: Image.Image) -> str:
    sample = image.copy()
    sample.thumbnail((32, 32), Image.Resampling.BILINEAR)
    stats = ImageStat.Stat(sample)
    red, green, blue = (round(channel) for channel in stats.mean[:3])
    return f"#{red:02x}{green:02x}{blue:02x}"


def build_from_jpg(original_path: Path, relative: Path) -> dict[str, object]:
    """Build one photo; relative is its conceptual WebP path below img/."""
    if not original_path.exists():
        raise FileNotFoundError(f"Original missing for {relative}: {original_path}")

    with Image.open(original_path) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        original_width, original_height = image.size
        color = dominant_color(image)

        generated: dict[str, str] = {}
        for width in sorted(WIDTHS, reverse=True):
            height = round(original_height * width / original_width)
            resized = image.resize((width, height), Image.Resampling.LANCZOS)
            destination = GENERATED_ROOT / relative.parent / f"{relative.stem}-{width}.webp"
            destination.parent.mkdir(parents=True, exist_ok=True)
            resized.save(
                destination,
                "WEBP",
                quality=QUALITY[width],
                method=4,
                optimize=True,
            )
            generated[str(width)] = destination.relative_to(ROOT).as_posix()
            resized.close()

    jpg_relative = Path("img") / relative.parent / "en_jpg" / f"{relative.stem}.jpg"
    identifier = relative.with_suffix("").as_posix()
    return {
        "id": identifier,
        "name": relative.stem,
        "collection": collection_for(relative),
        "category": category_for(relative),
        "width": original_width,
        "height": original_height,
        "color": color,
        "sources": generated,
        "download": f"{DOWNLOAD_ROOT}{jpg_relative.as_posix()}",
    }


def build_legacy(webp: Path) -> dict[str, object]:
    relative = webp.relative_to(IMAGE_ROOT)
    return build_from_jpg(source_jpg_for(webp), relative)


def load_manifest() -> list[dict[str, object]]:
    if not MANIFEST_PATH.exists():
        return []
    raw = MANIFEST_PATH.read_text(encoding="utf-8").strip()
    prefix = "window.PHOTO_MANIFEST="
    if not raw.startswith(prefix):
        raise ValueError("photo-manifest.js has an unexpected format")
    return json.loads(raw[len(prefix):].removesuffix(";"))


def write_manifest(records: list[dict[str, object]]) -> None:
    records.sort(key=lambda photo: str(photo["id"]))
    payload = json.dumps(records, ensure_ascii=False, separators=(",", ":"))
    MANIFEST_PATH.write_text(
        f"window.PHOTO_MANIFEST={payload};\n",
        encoding="utf-8",
    )


def import_photos(import_dir: Path, collection: str, originals_root: Path, workers: int) -> None:
    collection = collection.replace("\\", "/").strip("/")
    if collection not in VALID_COLLECTIONS:
        choices = "\n  - ".join(sorted(VALID_COLLECTIONS))
        raise SystemExit(f"Unknown collection '{collection}'. Choose:\n  - {choices}")
    if not import_dir.is_dir():
        raise SystemExit(f"Import directory does not exist: {import_dir}")
    if not (originals_root / ".git").exists():
        raise SystemExit(f"The originals worktree is invalid: {originals_root}")

    inputs = sorted(
        path for path in import_dir.iterdir()
        if path.is_file() and path.suffix.lower() in {".jpg", ".jpeg"}
    )
    if not inputs:
        raise SystemExit(f"No JPG found in: {import_dir}")

    collection_path = Path(*collection.split("/"))
    originals_dir = originals_root / "img" / collection_path / "en_jpg"
    originals_dir.mkdir(parents=True, exist_ok=True)

    jobs: list[tuple[Path, Path]] = []
    for source in inputs:
        destination = originals_dir / f"{source.stem}.jpg"
        shutil.copy2(source, destination)
        relative = collection_path / f"{source.stem}.webp"
        jobs.append((destination, relative))

    print(f"Importing {len(jobs)} photo(s) into {collection}", flush=True)
    new_records: list[dict[str, object]] = []
    with ThreadPoolExecutor(max_workers=max(1, workers)) as executor:
        futures = {
            executor.submit(build_from_jpg, original, relative): relative
            for original, relative in jobs
        }
        for index, future in enumerate(as_completed(futures), start=1):
            record = future.result()
            new_records.append(record)
            print(f"[{index}/{len(jobs)}] {record['id']}", flush=True)

    merged = {str(photo["id"]): photo for photo in load_manifest()}
    merged.update({str(photo["id"]): photo for photo in new_records})
    write_manifest(list(merged.values()))
    print(f"Manifest written with {len(merged)} records", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--import-dir", type=Path, help="Folder containing new JPG files")
    parser.add_argument("--collection", help="Target collection, for example roadTrip/AddoPark")
    parser.add_argument("--originals-root", type=Path, help="Path to the originals worktree")
    parser.add_argument(
        "--only",
        help="Legacy: build one source path relative to img, for example Landscape/IMG_5084.webp",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=min(4, os.cpu_count() or 1),
        help="Number of photos processed in parallel (default: up to 4)",
    )
    parser.add_argument("--skip-manifest", action="store_true")
    args = parser.parse_args()

    import_args = (args.import_dir, args.collection, args.originals_root)
    if any(import_args):
        if not all(import_args):
            parser.error("--import-dir, --collection and --originals-root must be used together")
        import_photos(
            args.import_dir.resolve(),
            args.collection,
            args.originals_root.resolve(),
            args.workers,
        )
        return

    if args.only:
        sources = [IMAGE_ROOT / args.only]
    else:
        sources = sorted(
            path for path in IMAGE_ROOT.rglob("*.webp")
            if GENERATED_ROOT not in path.parents
        )
    if not sources:
        raise SystemExit("No legacy sources found. Use Toolbox/add-photos.sh for new photos.")

    print(f"Building {len(sources)} photo(s) with {args.workers} worker(s)", flush=True)
    records: list[dict[str, object]] = []
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = {executor.submit(build_legacy, path): path for path in sources}
        for index, future in enumerate(as_completed(futures), start=1):
            record = future.result()
            records.append(record)
            print(f"[{index}/{len(sources)}] {record['id']}", flush=True)

    if not args.skip_manifest:
        write_manifest(records)
        print(f"Manifest written with {len(records)} records", flush=True)


if __name__ == "__main__":
    main()
