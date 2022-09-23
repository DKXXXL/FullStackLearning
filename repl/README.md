
https://www.freecodecamp.org/news/create-a-react-frontend-a-node-express-backend-and-connect-them-together-c5798926047c/

Interestingly, server for frontend and server as backend are two server application. This makes sense in real world but not too much in our toy app.

Though we still do this.

https://blog.logrocket.com/how-to-set-up-node-typescript-express/
This provides a way of constructing typescript with express

Finally we incorporate `src` directory by changing `tsconfig.json` with
```
  "include": [
    "src"
  ]
```

How the basic CRUD (create, read, update, delete) app on a database is constructed
https://www.geeksforgeeks.org/how-to-build-a-basic-crud-app-with-node-js-and-reactjs/

However, the functional correspondence is `useQuery` and `useMutation`
https://medium.com/swlh/getting-started-with-usequery-react-query-9ea181c3dd47

their semantic:
https://tkdodo.eu/blog/mastering-mutations-in-react-query


Interestingly, for Create-React-App, to change the port number
https://bobbyhadz.com/blog/react-create-react-app-change-port#:~:text=To%20change%20the%20default%20port,%2Dscripts%20start%22%20on%20Windows.

Now we make a very simple REPL -- only consists of a textbox, a button and our server will act as an evaluator

## Quick notes on HTML/CSS Styling
* We use `p {}` to apply styling to all `<p></p>`
* We use `#kkk {}` to apply styling to the stuff with id `kkk`
* We use `.navigation {}` to ... to those with class `navigation` e.g. `​<p class="navigation">Go Forward</p>`
* we also can use `p.navigation {}` to the class while with `p`, e.g. above 
* We can also use `a b c {}` as descendant selectors
* to have responsive design (i.e. automatic size adaption), we need to use BootStrap


***
