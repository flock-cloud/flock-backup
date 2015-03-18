flock-backup
============

Demo. Flock Backup Server for haproxy integration. Work in progress.

This is the backup server for each application/backend defined in haproxy.
It will process requests when a request hits haproxy and there is no other server available.
It will use Marathon API to spin up a new instance.
