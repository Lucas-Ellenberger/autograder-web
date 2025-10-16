#!/usr/bin/env python3

import sys
import os
import datetime
import pathlib

THIS_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
RESOURCES_DIR = os.path.abspath(os.path.join(THIS_DIR, '..', 'resources'))
HTML_TEMPLATE_FILE = os.path.join(RESOURCES_DIR, 'gallery_template.html')

def generate_site_html(site_root):
    if (not os.path.exists(HTML_TEMPLATE_FILE)):
        print(f"Error: Template HTML file not found at {HTML_TEMPLATE_FILE}.")
        return 1

    with open(HTML_TEMPLATE_FILE, 'r') as html_file:
        html = html_file.read()

        html = html.replace("{{ timestamp }}", datetime.datetime.utcnow().isoformat())
        html = html.replace("{{ runs }}", generate_image_sections(site_root))

    html_out_path = os.path.join(site_root, 'index.html')
    with open(html_out_path, 'w') as html_out_file:
        html_out_file.write(html)

    return 0

def generate_image_sections(site_root):
    screenshot_paths = get_sorted_image_directories(site_root)

    image_sections = []
    for screenshot_path in screenshot_paths:
        name = screenshot_path.name
        image_section = [f"<div class='run'><h2>{name}</h2><div class='img-grid'>"]

        for img in sorted(screenshot_path.glob("*.png")):
            rel_path = img.relative_to(site_root)
            image_section.append(f"<a href='{rel_path}' target='_blank'><img src='{rel_path}' alt='{img.name}'></a>")

        image_section.append("</div></div>")

        image_sections.append("\n".join(image_section))

    return "\n".join(image_sections)

def get_sorted_image_directories(site_root):
    screenshot_paths = []
    for path in site_root.iterdir():
        if (not path.is_dir()):
            continue

        if (not path.name.startswith("site-screenshots-")):
            continue

        screenshot_paths.append(path)

    return sorted(screenshot_paths, key = lambda path: path.stat().st_mtime, reverse = True)

def main():
    if (len(sys.argv) != 2):
        print("Usage: generate_site.py <site_root>")
        return 1

    site_root = pathlib.Path(sys.argv[1]).resolve()
    return generate_site_html(site_root)

if __name__ == '__main__':
    sys.exit(main())
