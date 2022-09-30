# Full Stack Learning for FP programmer, but in Typescript (WIP)
This introductory note is for some FP programmer with zero knowledge on web application. It originates from my own learning experiences of web application. 

Along the way, we will try to implement an REPL, a very small fake-duplicate of jupyter notebook, PL-toolchain-related software

We always use React+Typescript as our foundamental tool (i.e. every tool we introduced is surrounding these two).

## Road Map

- [x] Dynamic NQueen
- [x] REPL + Server (w/ syntax Highlighting)
- [ ] An REPL component (w/ syntax Highlighting + Autocomplete)
- [ ] Fake Jupyter Notebook (w/ good interface)
- [ ] Interaction with [Language Server](https://microsoft.github.io/language-server-protocol/) [Protocol](https://medium.com/ballerina-techblog/practical-guide-for-the-language-server-protocol-3091a122b750)
- [ ] ... (unplanned stuff)
- [ ] Make this whole project into a *notebook* a la [Tiark Rompf](https://tiarkrompf.github.io/notes/)


*** 
## All Basic Knowledge
We suggest directly go through [this coursera](https://www.coursera.org/learn/introduction-to-front-end-development) course. The infomation there is very trivial but systemaic enough for
zero-background people. It will cover some common knowledge of web development, including the big picture of HTML, CSS, HTTP, website, network, what Javascript is for and how it fits in the peciture of the rest of the HTML.

Only three weeks of materials, (skimmable with just 2 hours I think), skipping them is possible.

Another key fact is [when Javascript runs during rendering](https://stackoverflow.com/questions/1795438/load-and-execution-sequence-of-a-web-page).

## Starting React


However, contrary to in this coursera we use HTML as the basic skeleton, during web application of React + NodeJS, 
we will use React+JSX as the basic language to generate HTML.

JSX is a Javascript extension, syntxa of which mimic HTML so that we can generate HTML/CSS stuff(DOM) using Javascript. 

Usually, to use Javascript to manipulate HTML rendered stuff(DOM), it is related to altering the `innerHTML` property. Basically once use `document.getElementById("demo").innerHTML = "I have changed!"` in JS, it can alter the HTML content, like a runtime reflection. This gives a vibe of dynamic content on web.

But for React, everything is well-wrapped and we don't need to go through this hassel.

To get practical, we suggest the official React tutorials
* [Practical On hand Tutorial](https://reactjs.org/tutorial/tutorial.html)
* [Main Concept Manual](https://reactjs.org/docs/hello-world.html)
* [Hooks as functional component](https://reactjs.org/docs/hooks-intro.html)


The first one is very good when you go down *Option 2: Local Development Environment* -- because it teaches you (1.) how to use 'Create React App' to setup a react project (2.) Where is the entry point of the whole web-application -- usually `index.js`. (3.) it helps you to be familiar with the project structure.

***

However, the downside of using *Create React App* is, it is not clear on how React App is connected with NodeJs. We know NodeJs is only providing a server, and we know intuitivly it is passing back `index.html` in the `public` folder and `index.js/index.tsx` will modify the `root` div in the `html` accordingly. But
1. How is `index.html` passing back? (Maybe the correct way to ask how to implement these in vanilla )
2. Where is the program responsible for running the code in `index.tsx/index.js`? I don't find `index.tsx/index.js` included in `index.html`. In other word, [what happened in `Create React App` under the hood](https://www.freecodecamp.org/news/create-react-app-npm-scripts-explained/)?

However, even if we skip these technical details and don't understand what is happening with `Create React App`, using the intuition above, we still can continue the development.

***

The third tutorial is even more useful as a counterpart of class-based React components introduced in the first two tutorials. It is more functional as the hooks gives a vibe of *monadic programming*. We will mainly use this style of programming.



However, we don't suggest directly get hand dirty at this point because everything here is using Javascript. We will use Typescript throughout [also via Create React App](https://create-react-app.dev/docs/adding-typescript/).

```bash
npx create-react-app my-app --template typescript
```

At this point, one exercise you can do is to rewrite the tictactoe example using Hooks and Typescript.

However, our first example is a dynamic view of the searching process for the solution for N-Queen problem.

# [Animated N-Queen Searching](nqueen/nqueen2/README.md)


# [REPL, Version 1](repl/repl1/README.md) 