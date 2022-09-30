# Dynamic NQueen
We start with something very simple: a dynamic animation of NQueen searching, by reusing most of the CSS files provided in the *tictactoe* example. 

Instead of having a 3x3 board, we make a parameter n, and an nxn board.

# NQueen Searching

Recall how NQueen is solved -- it is done by backtracking -- we maintain a set of occupied queens, and for each row we try to add a new queen that is not conflicting to any existent queens. This whole idea can be easily written by a recursion. The challenge here is how to reprensent the dynamism. 

We simply modify the original NQueen searching recursion program into a generator `function*` program, and during the search we yield the current occupied queens, indicating the intermediate searching state of our recursive program. 

Our implementation can be found in `nqueen_gen`. Note that, even if we found a solution, we will not stop and act as nothing happens. We will search all the possible solution. The solution will be an intermediate state yielded by `nqueen_gen`

# Display

The final problem here is how to print a intermediate state in a board form, and actually this is the key part of fullstack learning. 

## Pure, But Not React-ful

Since we want the animation, we can use a timer to periodically iterate through each element in the `nqueen_gen` and 'refresh' the board accordingly. 

Of course, given a board state, we can construct a corresponding JSX element, and we can use `render` to refresh the rendering--

```javascript
setInterval(() => 
{
root.render(
  <React.StrictMode>
    <Nqueen_board n={queen_number} nqueen_st_stream={nqueen_gen(queen_number, [])} />
  </React.StrictMode>
);}, 1000)
```

This way of building front-end is fine and natural, because the timer will periodically refresh the rendering of the view, and there is no stateful things around. At least pretty functional in my view.

But this anti-pattern cannot scale -- we cannot just refresh everything everytime one component is refreshed. The correct React Program is to consider each (functional/stateful/class-based) component as a whole, and a front-end UI is constructed from multiple components.

## React-ful way

We construct a stateful/functional component that will register a timer in the first run, with the timer periodically extract the next state from the generator and update the internal state of the functional component. Via proper registering with *hooks*, the update of the internal state will notify the React to do the update of the UI.

Checkout `index.tsx`, but ...

More concretely, we [use State Hook](https://reactjs.org/docs/hooks-state.html) to contain the (internal) state of the whole board, upon which we do the render
```javascript
  let [st, setSt] = useState<nqueen_state>([]);
  // ...
  return (board_drawing(n, st))
```

`board_drawing` will return a JSX-element corresponding to the UI of the board w.r.t. that state. 

This `setSt` once called, will notify the whole React to recalculate the UI, i.e., re-execute `board_drawing`. This `setSt` should reminisce the monadic programming in Haskell.

Our component will also register a timer that will call `setSt` periodically, with the help of [Effect Hook](https://reactjs.org/docs/hooks-effect.html). 

Personally I don't like this name -- it is more like "Reactive Hook" for me -- it can monitor variable and will do side effect stuff when the dependent variable changed. But most commonly, we don't monitor any variable and it will run *on first render*. (I know it is a good time to complain this weird semantic but this design pattern seems cover a wide range of use-cases).

On the first render, we will register the timer and also register the deallocation method.
```javascript
  let interv = useRef<NodeJS.Timer>();
  // useRef can be used to store a mutable value that does not cause a re-render when updated.
  // the stored value will persists between renders.
  let update_nqueen_board = () => {
    let next = (nqueen_st_stream.next ());
    if (next.done !== undefined && (! next.done)) {
      setSt(next.value);
    } else {
      // unamount the timer
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

```

Now we have a (stateful) component that will animate the n-queen searching. We should consider this stateful component as a whole when constructing React program. 

See another advantages of this style of programming -- we only have *one source of fact* for doing rendering -- that is the `st`. We will stick with the *one source of fact* in the future, by using `useState`.

