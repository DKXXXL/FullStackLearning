# The Chatter
* Make sure `lwt`, (and `lwt_ppx`, `lwt.unix`) package is installed
* Use `make` to build, you can also check the oneline `ocamlopt` command that makes it
* `./chat Client [IP:Port]` will invoke the Client side
* `./chat Server [IP:Port]` will invoke the server side
* to quit a chatting session, press `Ctrl + C` (or send interactive interrupt signal corresponds to `Sys.sigint`)
  * a client will directly stop (and a receiver will stop a session) if
    * there is no server running at all
    * Ctrl + C
    * receiver stops
  * after a server stops a session, it will start the next listening
  * a server will stop listening if
    * Ctrl + C
* I only tested one server + one client a time, I haven't tested one server + multiple client trying to connect