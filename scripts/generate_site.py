#!/usr/bin/env python3

import datetime
import json
import os
import shutil
import subprocess
import sys

import requests

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

OWNER_DELIM = '<OWNER>'
REPO_DELIM = '<REPO>'
GITHUB_ACTIONS_ARTIFACT_URL = f"https://api.github.com/repos/{OWNER_DELIM}/{REPO_DELIM}/actions/artifacts"

RUNS_MARKER = '<!-- RUNS-MARKER -->'
MAX_RUNS = 20

def get_artifacts_url(owner, repo):
    artifacts_url = GITHUB_ACTIONS_ARTIFACT_URL.replace(OWNER_DELIM, owner)
    return artifacts_url.replace(REPO_DELIM, repo)

def get_actions_artifacts(url, token_cleartext):
    print("DEBUG: Getting the following URL: '%s'." % (url))
    try:
        raw_response = requests.request(
            method = 'GET',
            url = url,
            data = {'Authorization': f"Bearer: {token_cleartext}"})
    except requests.exceptions.ConnectionError:
        raise Exception("Could not connect to GitHub server at '%s'." % (url))

    try:
        response = raw_response.json()
    except Exception as ex:
        raise Exception("GitHub response does not contain valid JSON. Response:\n---\n%s\n---" % (raw_response.text))

    print(json.dumps(response, indent = 4))
    return response
    # if (not os.path.exists(SITE_BUILD_DIR)):
    #     return []

    # dirs = []
    # for name in os.listdir(SITE_BUILD_DIR):
    #     full_path = os.path.join(SITE_BUILD_DIR, name)
    #     if (not os.path.isdir(full_path)):
    #         continue

    #     if (not name.startswith('site-screenshots')):
    #         continue

    #     dirs.append(full_path)

    # dirs.sort(key = lambda directory: os.path.getmtime(directory), reverse = True)
    # print(f"DEBUG: Found the following run directories: '{dirs}'.")
    # return dirs[:MAX_RUNS]

def generate_run_section(run_dir):
    image_section = [f"<div class='run'><h2>{os.path.basename(run_dir)}</h2><div class='img-grid'>"]

    for name in sorted(os.listdir(run_dir)):
        if (not name.lower().endswith(".png")):
            continue

        image_path = os.path.join(run_dir, name)
        relative_path = os.path.relpath(image_path, SITE_BUILD_DIR)
        image_section.append(
            f"<a href='{relative_path}' target='_blank'><img src='{relative_path}' alt='{name}'></a>"
        )

    image_section.append("</div></div>")
    return "\n".join(image_section)

def generate_site_html(template_html, owner, repo, token_cleartext):
    url = get_artifacts_url(owner, repo)
    artifacts = get_actions_artifacts(url, token_cleartext)

    return template_html
    # run_sections = []
    # for run_dir in run_dirs:
    #     run_sections.append(generate_run_section(run_dir))

    # run_section_html = "\n".join(run_sections)

    # if RUNS_MARKER in template_html:
    #     html = template_html.replace(RUNS_MARKER, run_section_html)

    # return html

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

def build_site(owner, repo, token_cleartext):
    print(f"Building screenshot gallery at: {SITE_BUILD_DIR}")

    os.makedirs(SITE_BUILD_DIR, exist_ok=True)
    copy_template_files()

    template_file_path = os.path.join(TEMPLATE_HTML_DIR, "index.html")
    if (not os.path.exists(template_file_path)):
        print("Error: Could not find template index.html")
        return 1

    with open(template_file_path, "r", encoding = "utf-8") as template_file:
        template_html = template_file.read()

    html_output = generate_site_html(template_html, owner, repo, token_cleartext)

    out_path = os.path.join(SITE_BUILD_DIR, "index.html")
    with open(out_path, "w", encoding = "utf-8") as out_file:
        out_file.write(html_output)

    return 0

def main():
    # TODO: Get owner, repo, token from CLI.
    # TODO: May not need to get repo name.
    if (len(sys.argv) != 4):
        print("Usage: generate_site.py <GitHub Owner> <GitHub Repo> <Token Cleartext>")
        return 1

    owner = sys.argv[1]
    repo = sys.argv[2]
    token_cleartext = sys.argv[3]
    return build_site(owner, repo, token_cleartext)

if __name__ == '__main__':
    sys.exit(main())
