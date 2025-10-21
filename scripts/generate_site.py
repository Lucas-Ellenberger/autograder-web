#!/usr/bin/env python3

import datetime
import os
import shutil
import subprocess
import sys

# TODO: Prune unnecessary variables.
THIS_DIR = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
ROOT_DIR = os.path.abspath(os.path.join(THIS_DIR, '..'))
TEMPLATE_HTML_DIR = os.path.join(THIS_DIR, 'template', 'html')
BUILD_DIR = os.path.abspath(os.path.join(ROOT_DIR, 'build'))
IMAGES_BUILD_DIR = os.path.abspath(os.path.join(BUILD_DIR, 'html'))
SITE_BUILD_DIR = os.path.abspath(os.path.join(BUILD_DIR, 'site'))
IMAGES_DIRNAME = 'images'
IMAGES_OUT_DIR = os.path.abspath(os.path.join(BUILD_DIR, IMAGES_DIRNAME))
GEN_IMAGES_SCRIPT = os.path.abspath(os.path.join(THIS_DIR, 'generate_screenshots.py'))

RUNS_MARKER = '<!-- RUNS-MARKER -->'
MAX_RUNS = 20

def get_run_directories():
    if (not os.path.exists(SITE_BUILD_DIR)):
        return []

    dirs = []
    for name in os.listdir(SITE_BUILD_DIR):
        full_path = os.path.join(SITE_BUILD_DIR, name)
        if (not os.path.isdir(full_path)):
            continue

        # if (not name.startswith('site-screenshots')):
        #     continue

        dirs.append(full_path)

    dirs.sort(key = lambda directory: os.path.getmtime(directory), reverse = True)
    print(f"DEBUG: Found the following run directories: '{dirs}'.")
    return dirs[:MAX_RUNS]

def generate_run_section(run_dir):
    image_section = [f"<div class='run'><h2>{name}</h2><div class='img-grid'>"]

    for name in sorted(os.listdir(run_dir)):
        if name.lower().endswith(".png"):
            img_path = os.path.join(run_dir, name)
            rel_path = os.path.relpath(img_path, SITE_BUILD_DIR)
            section.append(
                f"<a href='{rel_path}' target='_blank'><img src='{rel_path}' alt='{name}'></a>"
            )

    section.append("</div></div>")
    return "\n".join(section)

def generate_site_html(template_html):
    run_dirs = get_run_directories()
    print(f"Found {len(run_dirs)} run directories to include.")

    run_sections = []
    for run_dir in run_dirs:
        run_sections.append(generate_run_section(run_dir))

    run_section_html = "\n".join(run_sections)

    if RUNS_MARKER in template_html:
        html = template_html.replace(RUNS_MARKER, run_section_html)

    return html

def copy_template_files():
    if not os.path.exists(TEMPLATE_HTML_DIR):
        print(f"Warning: Template HTML directory not found at {TEMPLATE_HTML_DIR}")
        return

    os.makedirs(SITE_BUILD_DIR, exist_ok = True)

    for item in os.listdir(TEMPLATE_HTML_DIR):
        source = os.path.join(TEMPLATE_HTML_DIR, item)
        dest = os.path.join(SITE_BUILD_DIR, item)
        if os.path.isdir(source):
            shutil.copytree(source, dest, dirs_exist_ok = True)
        else:
            shutil.copy2(source, dest)

def build_site():
    print(f"Building screenshot gallery at: {SITE_BUILD_DIR}")

    os.makedirs(SITE_BUILD_DIR, exist_ok=True)
    copy_template_files()

    template_file_path = os.path.join(TEMPLATE_HTML_DIR, "index.html")
    if (not os.path.exists(template_file_path)):
        print("Error: Could not find template index.html")
        return 1

    with open(template_file_path, "r", encoding = "utf-8") as template_file:
        template_html = template_file.read()

    html_output = generate_site_html(template_html)

    out_path = os.path.join(SITE_BUILD_DIR, "index.html")
    with open(out_path, "w", encoding = "utf-8") as out_file:
        out_file.write(html_output)

    return 0

def main():
    return build_site()

if __name__ == '__main__':
    sys.exit(main())
