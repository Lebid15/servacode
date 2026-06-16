#!/bin/bash
for d in servacode.com www.servacode.com admin.servacode.com api.servacode.com; do
  ip=$(dig +short "$d" @1.1.1.1 | head -1)
  echo "$d -> ${ip:-NOT_RESOLVED}"
done
