#!/usr/bin/env python
import os
import subprocess
import time
import atexit
import signal


def kill_child(cpid):
    if cpid is None:
        pass
    else:
        os.kill(cpid, signal.SIGTERM)



proc = subprocess.Popen(["mitmdump", "-s", "../tool/pre_dashlet_parse.py", "~u tiktok.com"],
    # stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )

child_pid = proc.pid
atexit.register(kill_child, cpid=child_pid)

(out, err) = proc.communicate()


# os.system("../tool/mitmdump -p 9989 -s ../tool/pre_parse.py")