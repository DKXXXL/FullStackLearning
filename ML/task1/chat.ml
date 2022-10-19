
open Lwt_io 
open Lwt 

exception NonImplement

(* Currently used as a poorman's info dumper *)
let info_print (s : string) = print_endline s

(* Existential type, because we might want a list of outchannel and inchannel *)
type arbitrary_channel = Package : ('a channel) ->  arbitrary_channel
(* Guarding to make sure chns are all open *)
let with_channel (chns : arbitrary_channel list) (f : unit -> 'b Lwt.t) (c : unit -> 'c Lwt.t) (default : 'b) : 'b Lwt.t = 
  let any_is_closed = List.fold_left (fun a (Package b) -> a || (Lwt_io.is_closed b)) false chns in 
  if any_is_closed then 
    begin 
    (* info_print "Some Channel is already closed!"; *)
    (let%lwt _ = c () in Lwt.return default) 
    end
  else f ()

let with_channel_unit chn f ?(when_end=(fun _ -> info_print "Channel Closed!"; Lwt.return ())) () = with_channel chn f when_end ()





(* The following is to resolve the problem that 
   there are two types of data, one messeage, one receipt
   *)
module type MessageProtocolInterface = sig 

  (* Enforced Abstraction, to enforce more invariant 
     i.e. send_receipt can only use recipt channel *)
  type content

  
  type about_message

  type about_receipt 
  (* Disconnect Channel is a channel for signalling disconnection *)
  type about_disconnect

  (* Classify the input channel into three channels
      where we also has an async thread doing the separation *)
  val classify_input : input_channel -> (about_message channel * about_receipt channel * about_disconnect channel * unit Lwt.t)


  val send_receipt : output_channel -> unit Lwt.t
  val send_message : output_channel -> content -> unit Lwt.t 
  val send_disconnect : output_channel -> unit Lwt.t

  (* val send_stuff : output_channel -> 'a -> unit Lwt.t *)

  val read_message : about_message channel ->  content Lwt.t 
  val read_receipt : about_receipt channel -> unit Lwt.t 
  val read_disconnect : about_disconnect channel -> unit Lwt.t

  (* val read_stuff : about_message channel -> 'a Lwt.t *)

end


(* This version is using \n as separator of the data
   so not really all encoding acceptable 
   Please Check the MessageProtocolArbitrary below for the version that supports arbitrary type
   *)
module MessageProtocolNaive : (MessageProtocolInterface with type content = string) = struct

  type content = string
  (* Old untyped way -- we make sure every
      untyped messages, when sent, has a header indicating the "type" of the message
      currently the allowed header is either receipt or msg
  *)
  let receipt_header = "0"
  let msg_header = "1"
  let on_close_header = "2"
  
  type datakind = Msg | Receipt | Disconnect

  let data_classification (s : string) =
    if String.starts_with s ~prefix:receipt_header then Receipt else 
    if String.starts_with s ~prefix:msg_header then Msg else 
    if String.starts_with s ~prefix:on_close_header then Disconnect else
    raise NonImplement

  let remove_header (s : string) = 
    match data_classification s with 
    | Msg  
    | Disconnect
    | Receipt -> 
      String.sub s 1 (String.length s - 1)

  (* we classify the channel into two parts, 
     one for recepit receiver
     one for real messages 
     we will have a worker doing this
     *)
  let classify_input (inchn : input_channel) : (input_channel * input_channel * input_channel * unit Lwt.t) = 
    let msg_inchn, msg_outchn = pipe () in 
    let receipt_inchn, receipt_outchn = pipe () in 
    let disconnect_inchn, disconnect_outchn = pipe() in 
    let rec classifier () = 
      with_channel [Package inchn] 
      begin 
        fun _ -> 
          (* info_print "Classifier Working Now!"; *)
          let%lwt newinfo = Lwt_io.read_line inchn in 
          (* info_print "New Line Coming, we classify!"; *)
          let%lwt _ = begin match data_classification newinfo with 
                      | Msg ->  let pureinfo = remove_header newinfo in 
                                Lwt_io.write_line msg_outchn pureinfo 
                      | Receipt -> Lwt_io.write_line receipt_outchn newinfo (* there is no content in receipt *)
                      | Disconnect -> Lwt_io.write_line disconnect_outchn newinfo 
                      end in 
            classifier ()
      end  
      (fun _ -> 
        info_print "Closing Classifier";
        let%lwt _ = Lwt_io.close msg_outchn in 
        let%lwt _ = Lwt_io.close receipt_outchn in 
        Lwt.return () 
        ) () (* Close the splitted Channel when inchn is closed *)
    in 
    (msg_inchn, receipt_inchn, disconnect_inchn, classifier())

  type about_message = input 

  type about_receipt = input 
  (* Disconnect Channel is a channel for signalling disconnection *)
  type about_disconnect = input

  let send_receipt (outchn : output_channel) : unit Lwt.t = Lwt_io.write_line outchn (receipt_header)
  let send_message (outchn : output_channel) s : unit Lwt.t = Lwt_io.write_line outchn (msg_header^s)
  let send_disconnect outchn = Lwt_io.write_line outchn on_close_header


  let read_message (inchn : input_channel) : string Lwt.t = Lwt_io.read_line inchn 

  let read_receipt (inchn : input_channel) : unit Lwt.t = Lwt_io.read_line inchn >>= (fun _ -> return_unit) 

  let read_disconnect (inchn : input_channel)  : unit Lwt.t = Lwt_io.read_line inchn >>= (fun _ -> return_unit)

end

module type content_ty = sig 
  type content
end 

module MessageProtocolArbitrary (X : content_ty) : (MessageProtocolInterface with type content = X.content) 
  = struct
    (* The arbitrary type the developer may want *)
  type content = X.content

  type msgty = Msg of content | Receipt | Disconnect


  (* a parameter, alter as you like *)
  let _LENGTH_ = 6


  (* Generic, Raw sending, using Marshall *)

  (* encode into <int> * <Marshal's String> *)
  let send_stuff_ (outchn : output_channel) (stuff : 'a) : unit Lwt.t = 
    let rawdata = Marshal.to_string (stuff) [] in 
    let l = String.length rawdata in 
    let encoded_l = string_of_int l in 
    let fix_length (l : string) =
      if String.length l < _LENGTH_ then String.sub (l^"AAAAAA") 0 _LENGTH_ else 
        (if String.length l > _LENGTH_ then raise (Failure "Too Large file") else l)  
      in 
    let encoded_l_with_fixed_length = fix_length encoded_l in 
    let all_info = encoded_l_with_fixed_length^rawdata in 
    Lwt_io.write outchn all_info

  (* inverse of send_stuff_  *)
  let read_stuff_ (inchn : input_channel) : 'a Lwt.t = 
    let unfix_string (l:string) = 
      let index = String.index l 'A' in 
      let l = String.sub l 0 index in 
      int_of_string l
    in 
    let%lwt the_length = 
      let%lwt encoded_length = Lwt_io.read ~count:_LENGTH_ inchn in 
      Lwt.return @@ unfix_string encoded_length in 
    let%lwt marshalled = Lwt_io.read ~count:the_length inchn in 
    Lwt.return @@ Marshal.from_string marshalled 0


  let classify_input (inchn : input_channel) : (input_channel * input_channel * input_channel * unit Lwt.t) = 
    let msg_inchn, msg_outchn = pipe () in 
    let receipt_inchn, receipt_outchn = pipe () in 
    let disconnect_inchn, disconnect_outchn = pipe() in 
    let rec classifier () = 
      with_channel [Package inchn] 
      begin 
        fun _ -> 
          (* info_print "Classifier Working Now!"; *)
          let%lwt (newinfo : msgty) = read_stuff_ inchn in 
          (* info_print "New Line Coming, we classify!"; *)
          let%lwt _ = begin match newinfo with 
                      | Msg ct ->  send_stuff_ msg_outchn ct 
                      | Receipt -> Lwt_io.write_line receipt_outchn "1" 
                      (* there is no content in receipt, 
                         we control here so we can use write line *)
                      | Disconnect -> Lwt_io.write_line disconnect_outchn "1" 
                      end in 
            classifier ()
      end  
      (fun _ -> 
        info_print "Closing Classifier";
        let%lwt _ = Lwt_io.close msg_outchn in 
        let%lwt _ = Lwt_io.close receipt_outchn in 
        Lwt.return () 
        ) () (* Close the splitted Channel when inchn is closed *)
    in 
    (msg_inchn, receipt_inchn, disconnect_inchn, classifier())

    type about_message = input 

    type about_receipt = input 
    (* Disconnect Channel is a channel for signalling disconnection *)
    type about_disconnect = input
  
    let send_receipt (outchn : output_channel) : unit Lwt.t = send_stuff_ outchn Receipt
    let send_message (outchn : output_channel) s : unit Lwt.t = send_stuff_ outchn (Msg s)
    let send_disconnect outchn : unit Lwt.t = send_stuff_ outchn Disconnect
  
  
    let read_message (inchn : input_channel) : content Lwt.t = read_stuff_ inchn 
  
    let read_receipt (inchn : input_channel) : unit Lwt.t = Lwt_io.read_line inchn >>= (fun _ -> return_unit) 
  
    let read_disconnect (inchn : input_channel)  : unit Lwt.t = Lwt_io.read_line inchn >>= (fun _ -> return_unit)
  
end



(* Setting The data type we want to send about
    here we can have all sorts of type defined
    
    but to test things, we only have string type to test
*)
module Dataty = struct 
  type content = string
end 

module MessageProtocolBetter = MessageProtocolArbitrary(Dataty)

(* The core functionality, do the chatting *)
(* Given input and output channel, do the chatting work *)
(* Currently this is fixed with stdout and stdin as interactive interface *)
let chatting ((inchn, outchn) : (input_channel * output_channel)) : unit Lwt.t = 
  (* first split the channel into msg and recepit *)
  info_print "New Link Connected!";
  (* let open MessageProtocolNaive in  *)
  let open MessageProtocolBetter in 
  let msg_inchn, receipt_inchn, disconnect_inchn, split_worker = classify_input inchn in 
  
  let rec reader_to_screen () = 
  with_channel_unit [Package msg_inchn; Package outchn]
  begin fun _ ->
    let%lwt newmessage = read_message msg_inchn in 
    let%lwt _ = send_receipt outchn in 
    let%lwt () = Lwt_io.printl newmessage in 
    reader_to_screen () 
  end ()
  in
  
  let rec writer_to_socket () = 
  with_channel_unit [Package receipt_inchn; Package outchn; Package stdin]
  begin fun _ ->
    let%lwt data = Lwt_io.(read_line stdin) in
    let before_sent = Sys.time() in 
    (* info_print "Writing New Things"; *)
    let%lwt () = send_message outchn data in 
    let%lwt _ = read_receipt receipt_inchn in 
    let roundtrip = Printf.sprintf "Message (%s) Delivered, roundtrip time: %fs" data (Sys.time() -. before_sent) in 
    info_print roundtrip;
    writer_to_socket () 
  end ()
  in 



  begin 
      (* The two workers *)
      let start_reading = reader_to_screen () in 
      let start_writing = writer_to_socket () in 
      let exit_chatting_threads () = 
        Lwt.cancel start_reading;
        Lwt.cancel start_writing; 
        Lwt.cancel split_worker;
        let%lwt _ = Lwt_io.close inchn in 
        let%lwt _ = Lwt_io.close outchn in 
        Lwt.return () in 

      let close_by_ourselves, close_ourselves = Lwt.wait () in 
      (* The following will cause problem, I don't know why *)
      (* let close_by_ourselves =  
        Lwt.bind close_by_ourselves exit_chatting_threads in   *)

      (* Ctrl + C can exit our loop *)
      let handler = 
        Lwt_unix.on_signal_full Sys.sigint (fun _ _ -> 
              let _ = send_disconnect outchn in 
              Lwt.wakeup_later close_ourselves ()
            ) in 
      let close_by_receiver = 
        let%lwt _ = read_disconnect disconnect_inchn in 
        info_print "Receiver Disconnected. Closing Right now...";
        exit_chatting_threads () 
      in 
      (* we stop when either side is saying they are done *)
      let%lwt _ = Lwt.pick [close_by_receiver; close_by_ourselves] in 
      Lwt_unix.disable_signal_handler handler;
      info_print "Link Disconnected!";
      Lwt.return ()
    
  end



(* Configuration, Hardwired. *)
let server_addr _LOCAL_HOST port = 
  (* let socket = Lwt_unix.socket Unix.PF_INET Unix.SOCK_STREAM 0 in  *)
  (* let _LOCAL_HOST = "127.0.0.1" in  
  let port = 3000 in  *)
  (Unix.ADDR_INET(Unix.inet_addr_of_string _LOCAL_HOST, port))


(* This following version of start_server is somehow not satisfactory
    I can test a bug out... I don't really know the behaviour ... *)
(* let rec start_server () =  
  let rec keep_waiting () =
    let%lwt _ =  Lwt.pause () in 
    keep_waiting () in 
  info_print "Starting Server ...";
  let%lwt _ = Lwt_io.establish_server_with_client_address server_addr (fun _ p -> chatting p) in 
  keep_waiting () *)

let start_server (server_addr : Unix.sockaddr) = 
  info_print "Starting Server ...";
  let open Lwt in
  let listening_socket = 
    let open Lwt_unix in
    let sock = socket PF_INET SOCK_STREAM 0 in
    let%lwt _ =  bind sock @@ server_addr in 
    listen sock 0;
    Lwt.return sock
  in 
  let rec serve () = 
  info_print "Listening ...";
    let%lwt sock = listening_socket in 
    let%lwt msg_socket, _ = Lwt_unix.accept sock in 
    let inch = Lwt_io.of_fd ~close:(fun _ -> return ()) ~mode:Lwt_io.Input msg_socket in 
    let outch = Lwt_io.of_fd ~close:(fun _ -> return ()) ~mode:Lwt_io.Output msg_socket in 
    let%lwt _ = chatting (inch,outch) in 
    (* Close File Descripter cause problem ... Why? *)
    (* let%lwt _ = Lwt_unix.close msg_socket in  *)
    serve() in 
  serve()


let start_client (server_addr : Unix.sockaddr) =
  info_print "Trying to Connect ...";
    Lwt_io.with_connection server_addr chatting

(* Arguments *)
let () =
  if Array.length Sys.argv != 3
     || not (Sys.argv.(1) = "Server" || Sys.argv.(1) = "Client")
    then 
    begin
      Printf.printf "Usage: First argument either Server or Client, Second Argument IP:Port\n";
      for i = 0 to Array.length Sys.argv - 1 do
        Printf.printf "[%i] %s\n" i Sys.argv.(i)
      done;
      exit (-1)
    end
    else (); 
  let ip,port = 
    let ipport = Sys.argv.(2) in 
    let index = String.index ipport ':' in 
    let ip = String.sub ipport 0 index in 
    let port = String.sub ipport (index+1) (String.length ipport - (index + 1)) in 
    let port = int_of_string port in 
    (ip, port) 
  in 
  let svr_addr = server_addr ip port in 
  Lwt_main.run @@
  if Sys.argv.(1) = "Server" 
    then 
    let%lwt _ = start_server svr_addr in 
    Lwt.return_unit
    else
    start_client svr_addr

  