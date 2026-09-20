#!/bin/sh
# Only act on the portal certificate; leave other applications' hooks alone.
case " ${RENEWED_DOMAINS:-} " in
  *" durnoty.pl "*) /usr/sbin/nginx -t && /usr/bin/systemctl reload nginx ;;
esac
