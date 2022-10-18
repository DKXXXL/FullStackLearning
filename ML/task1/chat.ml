
open Lwt_io 

exception NonImplement

type arbitrary_channel = Package : ('a channel) ->  arbitrary_channel

(* Guarding to make sure chns are all open *)
let with_channel (chns : arbitrary_channel list) (f : unit -> 'b Lwt.t) (c : unit -> 'c Lwt.t) (default : 'b) : 'b Lwt.t = 
  let any_is_closed = List.fold_left (fun a (Package b) -> a || (Lwt_io.is_closed b)) false chns in 
  if any_is_closed then 
    (let%lwt _ = c () in Lwt.return ()) 
  else f ()

let with_channel_unit chn f ?(when_end=(fun _ -> Lwt.return ())) () = with_channel chn f when_end ()

(* The following is to resolve the problem that 
   there are two types of data, one messeage, one receipt
   *)
module MessageProtocal = struct

  (* Old untyped way -- we make sure every
      untyped messages, when sent, has a header indicating the "type" of the message
      currently the allowed header is either receipt or msg
  *)
  let receipt_header = "0"
  let msg_header = "1"
  
  type datakind = Msg | Receipt

  let data_classification (s : string) =
    if String.starts_with s ~prefix:receipt_header then Receipt else 
    if String.starts_with s ~prefix:msg_header then Msg else 
    raise NonImplement

  let remove_header (s : string) = 
    match data_classification s with 
    | Msg  
    | Receipt -> 
      String.sub s 1 (String.length s - 1)
  (* Make sure the header is lawful -- i.e. either receipt or msg 
      But We maynot need this function   
  *)
  let validate_header (_ : input_channel) : unit Lwt.t = raise NonImplement 

  (* we classify the channel into two parts, 
     one for recepit receiver
     one for real messages 
     we will have a worker doing this
     *)
  let classify_input (inchn : input_channel) : (input_channel * input_channel * unit Lwt.t) = 
    let msg_inchn, msg_outchn = pipe () in 
    let receipt_inchn, receipt_outchn = pipe () in 
    let rec classifier () = 
      with_channel [Package inchn] 
      begin 
        fun _ -> 
          let%lwt newinfo = Lwt_io.read_line inchn in 
          let%lwt _ = begin match data_classification newinfo with 
                      | Msg ->  let pureinfo = remove_header newinfo in 
                                Lwt_io.write_line msg_outchn pureinfo 
                      | Receipt -> Lwt_io.write_line receipt_outchn newinfo (* there is no content in receipt *)
                      end in 
            classifier ()
      end  
      (fun _ -> 
        let%lwt _ = Lwt_io.close msg_outchn in 
        let%lwt _ = Lwt_io.close receipt_outchn in 
        Lwt.return () 
        ) () (* Close the splitted Channel when inchn is closed *)
    in 
    (msg_inchn, receipt_inchn, classifier())

  let send_receipt (outchn : output_channel) : unit Lwt.t = Lwt_io.write_line outchn receipt_header
  let send_message s (outchn : output_channel) : unit Lwt.t = Lwt_io.write_line outchn (msg_header^s)
    
end





(* Given input and output channel, do the chatting work *)
(* Currently this is fixed with stdout and stdin as interactive interface *)
let chatting ((inchn, outchn) : (input_channel * output_channel)) : unit Lwt.t = 
  (* first split the channel into msg and recepit *)
  let msg_inchn, receipt_inchn, split_worker = MessageProtocal.classify_input inchn in 
  
  let rec reader_to_screen () = 
  with_channel_unit [Package msg_inchn; Package outchn]
  begin fun _ ->
    let%lwt newmessage = Lwt_io.read_line msg_inchn in 
    let%lwt _ = MessageProtocal.send_receipt outchn in 
    let%lwt () = Lwt_io.printl newmessage in 
    reader_to_screen () 
  end ()
  in
  
  let rec writer_to_socket () = 
  with_channel_unit [Package receipt_inchn; Package outchn; Package stdin]
  begin fun _ ->
    let before_sent = Sys.time() in 
    let%lwt data = Lwt_io.(read_line stdin) in
    let%lwt () = Lwt_io.write outchn data in 
    let%lwt _ = Lwt_io.read_line receipt_inchn in 
    Printf.printf "Message (%s) Delivered, roundtrip time: %fs\n" data (Sys.time() -. before_sent);
    writer_to_socket () 
  end ()
  in 

  let start_reading = reader_to_screen () in 
  let start_writing = writer_to_socket () in 
  let%lwt _ = start_reading in 
  let%lwt _ = start_writing in 
  let%lwt _ = split_worker in 
  Lwt.return ()



(* Configuration *)
let server_addr = 
  (* let socket = Lwt_unix.socket Unix.PF_INET Unix.SOCK_STREAM 0 in  *)
  let _LOCAL_HOST = "127.0.0.1" in  
  let port = 9998 in 
  (Unix.ADDR_INET(Unix.inet_addr_of_string _LOCAL_HOST, port))


let rec start_server () =  
    let%lwt _ = Lwt_io.establish_server_with_client_address server_addr (fun _ p -> chatting p) in 
    start_server ()
    (* Wait for the next connection*)

let start_client () =
    Lwt_io.with_connection server_addr chatting


let () =
  if Array.length Sys.argv != 1
     || (Array.get Sys.argv 0 != "Server" && Array.get Sys.argv 0 != "Client")
    then 
    begin
      Printf.printf "Usage: One argument either Server or Client";
      exit (-1)
    end
    else (); 
  Lwt_main.run @@
  if Array.get Sys.argv 0 == "Server" 
    then 
    start_server () 
    else
    start_client ()

  