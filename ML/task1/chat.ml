
open Lwt_io 

exception NonImplement

(* The following is to resolve the problem that 
   there are two types of data, one messeage, one receipt
   Apparently we can add a header in the front of the string
    to distinguish
   But the direct style of programming cannot accept this ... because 
    we don't have peek!
   if we have peek, then we can just finish the get_info
    stucked.
   *)
module MessageProtocal = struct

  (* Old untyped way -- we make sure every
      untyped messages, when sent, has a header indicating the "type" of the message
      currently the allowed header is either receipt or msg
  *)
  let receipt_header = "0"
  let msg_header = "1"
  
  (* Make the header is lawful -- i.e. either receipt or msg 
      But We maynot need this function   
  *)
  let validate_header (f : input_channel) : unit Lwt.t = raise NonImplement 

  (* The idea is to peak the head of the channel
      using pred, the int is the length of the header to peak
      if it is, then we really read the header, but note we have to use atomic read (read_line is)
      if it is not, we use pause function to temparary to shift to other thread  
      *)
  let get_info_with_header (f : input_channel) (pred : (int* (string -> bool))) : string Lwt.t = 
    (* but we don't have peek! *)
    raise NonImplement

  let send_message (s : string) (f : output_channel) : unit Lwt.t = 
    Lwt_io.write_line f (msg_header^s)
  let read_message (f : input_channel) : string Lwt.t = 
    let pred = (String.length msg_header, fun s -> s == msg_header) in 
    get_info_with_header f pred

  let send_receipt (f : output_channel) : unit Lwt.t = 
    Lwt_io.write_line f receipt_header 

  let wait_receipt (f : input_channel) : unit Lwt.t = raise NonImplement


end


(* Configuration *)
let server_addr = 
  (* let socket = Lwt_unix.socket Unix.PF_INET Unix.SOCK_STREAM 0 in  *)
  let _LOCAL_HOST = "127.0.0.1" in  
  let port = 9998 in 
  (Unix.ADDR_INET(Unix.inet_addr_of_string _LOCAL_HOST, port))

let start_chatting (sock : Lwt_unix.file_descr) = 
  let rec reader_to_screen chn = 
    let%lwt newmessage = Lwt_io.read_line chn in 
    let%lwt () = Lwt_io.printl newmessage in
    Lwt_io. 
    reader_to_screen chn in
  
  
  let rec writer_to_socket chn = 
    let%lwt data = Lwt_io.(read_line stdin) in
    let%lwt () = Lwt_io.write_line chn data in 
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
  