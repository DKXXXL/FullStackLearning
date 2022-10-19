chat: chat.ml
	ocamlfind opt -linkpkg -thread -package lwt_ppx,lwt.unix chat.ml -o ./chat

clean:
	rm -f ./chat
	rm -f *.cmi
	rm -f *.cmx
	rm -f *.o