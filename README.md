
# Domulo user's guide

Domulo is a VDOM implementation experiment with an alternate and fast way to store and do things.

Domulo linearizes the VDOM n-ary tree structure so :

- it can be easily serialized and even more streamed
- it allows filtering nodes and querying against them
- it's designed to be fast and developper-friendly

It uses internally a Block Memory Pool (preallocated memory) which is a combination of an array of contiguous blocks and a lookup hashmap. This datastructure can hold other graph data structures such as Finite State Machines, Entity Relational Diagrams and many more.

## DISCLAIMER (WIP)

this is *actually* an experimental work and it is not suitable for production use. The work is in progress !

## How it works ?

based on a Blocks Memory Pool data structure. For ore informations [read this page](./guide/vdom-internals.md).

## Basic usage

1. create ian initialisation file in ypur root project folder, which imports domulo setup and re-export all symbols :

    ```
    // src/app/wrap.js
    import { wrap } from '@/src/domulo'
    
    // key is a 8-characters alhpanumeric string for salting internal generator
    export const domulo = wrap({ key: 'peACEful '})
    ```

2. Then every time you need to use domulo,invoke its wrapped version

    ```
     // src/app/todlo-list.js
    import { domulo } from 'src/app/wrap.js'

    const TodoList = (props) => {
       return domulo.h('section', {},
         domulo.h('h1', {}, 'Todo List Items'),
         domulo.h('ul', {},
           props.todos.map(todo =>
            domulo.h('li', {},
              domulo.h('p', {}, todo.litle +  ' ' + todo.done )
            )
          )
        )
      )
    }
    ```

3. src/app/ in your index.js put the following :

    ```
    import { domulo } from 'src/app/wrap.js'
    import { TodoList } from 'src/app/todo-list.js'

    const props = {
      todos: [
        { title: 'code', done: true },
        { title: 'test', done: false },
        { title: 'run', done: false }
      ]
    }
    const todolist = TodoList(props)

    domulo.mount(todolist, document.getElementById('div#app'))
    ```

Domulo is based on functional components. You can also use JSX.

## Roadmap

* mount/diff/patch functions to implement
* serialize/deserialize/stream to implement
* documentation
* test and test again


