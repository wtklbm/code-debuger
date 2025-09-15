#!/usr/bin/env bash

shopt -s globstar

basedir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"

# 将绝对路径转换为相对路径
to_relative_path() {
    realpath --relative-to="${2:-$(pwd)}" "$1"
}

find "$basedir" -maxdepth 1 -type f -print0 | while read -rd $'\0' item; do
    if [[ "$item" =~ ".sh"$ ]]; then
        continue
    fi

    echo $basedir
done
