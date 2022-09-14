# Full Stack Learning for FP programmer, but in Typescript
This introductory note is for some FP programmer with zero knowledge on web application.

The final target is to implement a very small fake-duplicate of jupyter notebook.

We use React as our foundamental tool

## All Basic Knowledge
We suggest directly go through [this coursera](https://www.coursera.org/learn/introduction-to-front-end-development) course. The infomation there is very trivial but systemaic enough for
zero-background people. It will cover some common knowledge of web development.


## Starting React


However, contrary to in this coursera we use HTML as the basic framework, during web application of React + NodeJS, 
we will use JSX as the basic language to generate HTML.

JSX is a Javascript extension, syntxa of which mimic HTML so that we can generate HTML/CSS stuff using Javascript. 

Usually, to use Javascript to manipulate HTML rendered stuff(DOM) is related to altering the `innerHTML` property. But for React, everything is well-wrapped and we don't need to go through this hassel.

To get practical, we suggest the official React tutorials
* [Practical On hand Tutorial](https://reactjs.org/tutorial/tutorial.html)
* [Main Concept Manual](https://reactjs.org/docs/hello-world.html)
* [Hooks as functional component](https://reactjs.org/docs/hooks-intro.html)


The first one is very good when you go down *Option 2: Local Development Environment* -- because it teaches you (1.) how to use Create React App to setup a react project (2.) Where is the entry point of the whole web-application -- usually `index.js`. 

The third tutorial is even more useful as a counterpart of class-based components introduced in the first two tutorials. It is more function as the hooks gives a vibe of *monadic programming*.

However, we don't suggest directly get hand dirty at this point because everything here is using Javascript. We will use Typescript throughout [also via Create React App](https://create-react-app.dev/docs/adding-typescript/).

At this point, one exercise you can do is to rewrite the tictactoe example using Hooks and Typescript.

However, our first example is a dynamic view of the search of the solution for N-queen problem.

# N-queen