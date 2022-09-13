import React, { useState, useEffect, useRef } from 'react';
// import { unmountComponentAtNode } from 'react-dom';
import { createRoot } from 'react-dom/client';
// import { Provider } from 'react-redux';
import './index.css';

const container = document.getElementById('root')!;
const root = createRoot(container);



// ////////
//  First Attempts
// ////////
// // We start with a totally pure 
// function nqueen (n : number, occupied : Array<[number, number]>) : Array<Array<[number, number]>> {
//   // 2D array of boolean
//   let occupied_queens = occupied.length ;
//   if (occupied_queens == n) {
//     // we get one solution
//     return [occupied]
//   }
//   let current_x = occupied_queens;
//   // then (occupied_queens, _) not in occupied 
//   // we calculate the candidates
//   let all_candidates_y = [...Array(n).keys()];
// }

// then we step by step expose the internal state

// using a stack
// nqueen_state is the last position, and the current testing y of the current row 
// type nqueen_state = [[number, number], number];
// type nqueen_stack = Array<nqueen_state>;
// type nqueen_result = Array<Array<[number, number]>>;
// function occupied_queens (nq : nqueen_stack) : Array<[number, number]> {
//   return [[1,2]]
// }

// ////////
//  Second Attempt
// ////////

// function nqueen_transition (n : number, stack : nqueen_stack, res : nqueen_result) : [nqueen_stack, nqueen_result] {
//   // 2D array of boolean
//   let occupied = occupied_queens(stack);
//   let occupied_number = occupied.length;
//   if (occupied_number >= n){
//     let newres2 = res.slice();
//     newres2.push(occupied);
//     let newstack = stack.slice();
//     let [[lastx, lasty],current_y] = newstack.pop()!; 
    
//     return
//   } 

// }
// but this style is too state machine, it is hard to see the invariance to program correctly

// ////////
//  Third Attempt
// ////////

type nqueen_state = Array<[number, number]>;

function can_attack (co1 : [number, number], co2 : [number, number]) : boolean {
  let [co1x, co1y] = co1;
  let [co2x, co2y] = co2;
  return (co1x === co2x) || (co1y === co2y) || (Math.abs(co1x - co2x) === Math.abs(co1y - co2y))
}

function is_new_conflicting (occupation : nqueen_state, newco : [number, number]) : boolean {
  let candidates = occupation.map((co1, _) => can_attack(co1, newco));
  return candidates.reduce((a, b, _) => a || b, false);
}

// But it turns out to be too complicated. Let's try using generator as the intermediate output for a procedure
// We again start with a totally pure 

// function nqueen_gen (n : number, occupation : nqueen_state) : void {
//   // 2D array of boolean
//   let current_x = occupation.length;
//   if (current_x >= n) {
//     // base case, we have filled in 
//     return
//   }
//   for (const current_y of Array(n).keys()){
//     if (! is_new_conflicting (occupation, [current_x,current_y])) {
//       let newoccupation = occupation.slice();
//       newoccupation.push([current_x, current_y]);
//       // yield happens here, but it will pollute the whole function into async, so
//       return nqueen_gen(n, newoccupation)
//     }
//   }

// }

function* nqueen_gen (n : number, occupation : nqueen_state) : Generator<nqueen_state, void,void> {
  // 2D array of boolean
  let current_x = occupation.length;
  if (current_x >= n) {
    // base case, we have filled in 
    return
  }
  for (const current_y of Array(n).keys()){
    if (! is_new_conflicting (occupation, [current_x,current_y])) {
      let newoccupation = occupation.slice();
      newoccupation.push([current_x, current_y]);
      yield newoccupation;
      // yield happens here, but it will pollute the whole function into async, so
      yield* nqueen_gen(n, newoccupation)
    }
  }
  return;
}

// 
// Only if we can follow https://redux.js.org/tutorials/fundamentals/part-1-overview
//   where no hook is ever used, and almost no react is used, we direct render html stuff from state
// direct render!
// but it is said to be inefficient


// Thus we will just use react itself, 
//  let's go functional even though class-based is actually nicer in my opinion
//    maybe at one point I will know class-based is bad
//  to be honest, the whole thing is monadic programming


// functional component : drawing nqueen state 
// nqueen_canvas_st = current nqueen_state * all the solution to nqueen
function board_drawing (n : number, to_draw : Array<[number, number]>) {
  let one_square = (ifx : boolean) => {
    return (
      <button className="square">
        {ifx ? "X" : ""}
      </button>
    );
  }

  let xaxis = Array(n).fill(null);
  let xycos = xaxis.map((_, xco) => {
    let one_row_of_elm = Array(n).fill(null).map((_, yco) => 
      one_square(to_draw.some((v, _) => (v[0] === xco) && (v[1] === yco)))
    );
    // now we combine one_row_of_elm into onerow
    let onerow = (
      <ul> {one_row_of_elm} </ul>
    );

    return (
      <div className='board-row'> {onerow} </div>
    )
  })
  return (
    <div>
      <ul> {xycos} </ul>
    </div>
  )
}

let interval_time = 10;

// type nqueen_board_st = [nqueen_state, Array<nqueen_state>];
interface nqueen_prop {
  n : number;
  nqueen_st_stream : Generator<nqueen_state, void,void>;
}

// it has to be captialized
function Nqueen_board (prop : nqueen_prop) {
  // let nqueen_st_stream = nqueen_gen(n, []);
  let {n, nqueen_st_stream} = prop;
  let [st, setSt] = useState<nqueen_state>([]);

  let interv = useRef<NodeJS.Timer>();
  let update_nqueen_board = () => {
    let next = (nqueen_st_stream.next ());
    if (next.done !== undefined && (! next.done)) {
      setSt(next.value);
    } else {
      // unamountClock
      clearInterval((interv.current)!);
    }
  };


  // https://upmostly.com/tutorials/setinterval-in-react-components-using-hooks
  // https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
  // useEffect as amount/unamount  
  useEffect(() => {
    const interval = setInterval(() => {
      update_nqueen_board();
    }, interval_time);
    interv.current = interval;
    return () => clearInterval(interval);
  }, []);

  return (board_drawing(n, st));
}

let queen_number = 8;

root.render(
  <React.StrictMode>
    <Nqueen_board n={queen_number} nqueen_st_stream={nqueen_gen(queen_number, [])} />
  </React.StrictMode>
);


