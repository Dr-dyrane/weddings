#!/usr/bin/env bash
set -euo pipefail

dev_host="0.0.0.0"
dev_port="3000"
next_args=()
production_preview=0

while [[ "$#" -gt 0 ]]; do
  case "$1" in
    --host|--hostname|-H)
      dev_host="$2"
      shift 2
      ;;
    --port|-p)
      dev_port="$2"
      shift 2
      ;;
    --strictPort)
      production_preview=1
      shift
      ;;
    *)
      next_args+=("$1")
      shift
      ;;
  esac
done

if [[ "${production_preview}" == "1" && -f ".next/BUILD_ID" ]]; then
  if [[ "${#next_args[@]}" -gt 0 ]]; then
    exec next start --hostname "${dev_host}" --port "${dev_port}" "${next_args[@]}"
  fi
  exec next start --hostname "${dev_host}" --port "${dev_port}"
fi

if [[ "${#next_args[@]}" -gt 0 ]]; then
  exec next dev --hostname "${dev_host}" --port "${dev_port}" "${next_args[@]}"
fi
exec next dev --hostname "${dev_host}" --port "${dev_port}"
