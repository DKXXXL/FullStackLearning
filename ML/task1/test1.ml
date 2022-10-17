(* open Base *)
(* open Lwt *)

(* Why  *)
(* let rec repeat (f : unit -> 'a Lwt.t) : 'a Lwt.t = 
  let%lwt _ = f () in 
  (repeat f)  *)
  (* Lwt.bind f (fun _ -> repeat f) *)

let rec output_hello () = 
  let%lwt () = Lwt_unix.sleep 2.0 in
  let%lwt () = Lwt_io.printl "hello" in
  output_hello ()

let rec echo () = 
  let%lwt data = Lwt_io.(read_line stdin) in
  let%lwt () = Lwt_io.printl data in
  echo ()  


let () =
  print_endline "Starts";
  Lwt_main.run 
  begin
  (* let h1 = output_hello () in 
  let h2 = echo () in 
  let%lwt _ = h1 in 
  let%lwt _ = h2 in  *)
  let%lwt _ = Lwt.join [echo(); output_hello ()] in 
  Lwt.return ()
  end
  