
open Lwt_io 



(* Configuration *)
let server_addr = 
  let socket = Lwt_unix.socket Unix.PF_INET Unix.SOCK_STREAM 0 in 
  let _LOCAL_HOST = "127.0.0.1" in  
  let port = 9998 in 
  (Unix.ADDR_INET(Unix.inet_addr_of_string _LOCAL_HOST, port))

let start_chatting (sock : Lwt_unix.file_descr) = 
  let rec reader_to_screen chn = 
    let%lwt newmessage = Lwt_io.read_line chn in 
    let%lwt () = Lwt_io.printl newmessage in 
    reader_to_screen chn in
  
  
  let rec writer_to_socket chn = 
    let%lwt data = Lwt_io.(read_line stdin) in
    let%lwt () = Lwt_io.write chn data in 
    writer_to_socket chn in 
  let inchn = Lwt_io.of_fd ~mode:Lwt_io.Input sock in 
  let outchn = Lwt_io.of_fd ~mode:Lwt_io.Output sock in 

  let start_reading = reader_to_screen inchn in 
  let start_writing = writer_to_socket outchn in 
  (* wait for either sides to complete *)
  let%lwt _ = start_reading in 
  let%lwt _ = start_writing in 
  Lwt.return ()


(* Currently this is fixed with stdout and stdin *)
let chatting ((inchn, outchn) : (input_channel * output_channel)) : unit Lwt.t = 
  let rec reader_to_screen chn = 
    let%lwt newmessage = Lwt_io.read_line chn in 
    let%lwt () = Lwt_io.printl newmessage in 
    reader_to_screen chn in
  
  let rec writer_to_socket chn = 
    let%lwt data = Lwt_io.(read_line stdin) in
    let%lwt () = Lwt_io.write chn data in 
    writer_to_socket chn in 

  let start_reading = reader_to_screen inchn in 
  let start_writing = writer_to_socket outchn in 
  let%lwt _ = start_reading in 
  let%lwt _ = start_writing in 
  Lwt.return ()


let rec start_server () =  
    let%lwt _ = Lwt_io.establish_server_with_client_address server_addr (fun _ p -> chatting p) in 
    start_server ()
    (* Wait for the next connection*)

let start_client =
    Lwt_io.with_connection server_addr chatting


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
  