"""Build responsive WebP assets and the JSPictureStudio photo manifest.

Run from the repository root:
    python Toolbox/build_images.py

The script reads the original JPG located beside each legacy WebP, creates
640/1280/2560 pixel-wide variants and writes photo-manifest.js.
"""

from __future__ import annotations

import argparse
import json
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image, ImageOps, ImageStat


ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOT = ROOT / "img"
GENERATED_ROOT = IMAGE_ROOT / "generated"
WIDTHS = (640, 1280, 2560)
QUALITY = {640: 68, 1280: 74, 2560: 80}
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


def build_one(webp: Path) -> dict[str, object]:
    relative = webp.relative_to(IMAGE_ROOT)
    original_path = source_jpg_for(webp)
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
            destination = GENERATED_ROOT / relative.parent / f"{webp.stem}-{width}.webp"
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

    jpg_relative = original_path.relative_to(ROOT).as_posix()
    identifier = relative.with_suffix("").as_posix()
    return {
        "id": identifier,
        "name": webp.stem,
        "collection": collection_for(relative),
        "category": category_for(relative),
        "width": original_width,
        "height": original_height,
        "color": color,
        "sources": generated,
        "download": f"{DOWNLOAD_ROOT}{jpg_relative}",
    }


def write_manifest(records: list[dict[str, object]]) -> None:
    records.sort(key=lambda photo: str(photo["id"]))
    payload = json.dumps(records, ensure_ascii=False, separators=(",", ":"))
    destination = ROOT / "photo-manifest.js"
    destination.write_text(
        f"window.PHOTO_MANIFEST={payload};\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--only",
        help="Build one source path relative to img, for example Landscape/IMG_5084.webp",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=min(4, os.cpu_count() or 1),
        help="Number of photos processed in parallel (default: up to 4)",
    )
    parser.add_argument(
        "--skip-manifest",
        action="store_true",
        help="Do not replace photo-manifest.js (useful for a sample build)",
    )
    args = parser.parse_args()

    if args.only:
        sources = [IMAGE_ROOT / args.only]
    else:
        sources = sorted(
            path
            for path in IMAGE_ROOT.rglob("*.webp")
            if GENERATED_ROOT not in path.parents
        )

    missing = [path for path in sources if not path.exists()]
    if missing:
        raise SystemExit(f"Source does not exist: {missing[0]}")

    print(f"Building {len(sources)} photo(s) with {args.workers} worker(s)", flush=True)
    records: list[dict[str, object]] = []
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        futures = {executor.submit(build_one, path): path for path in sources}
        for index, future in enumerate(as_completed(futures), start=1):
            record = future.result()
            records.append(record)
            print(f"[{index}/{len(sources)}] {record['id']}", flush=True)

    if not args.skip_manifest:
        write_manifest(records)
        print(f"Manifest written with {len(records)} records", flush=True)


if __name__ == "__main__":
    main()
