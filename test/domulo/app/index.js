
import { domulo } from "@/test/domulo/app/wrap"
import { TodoList } from '@/test/domulo/app/todo-list'
import { TodoItem } from '@/test/domulo/app/todo-item'

const props = {
  todos:  [
//    { title: 'todo-1', priority: 1, done: false },
//    { title: 'todo-2', priority: 5, done: false },
//    { title: 'todo-3', priority: 4, done: true },
//    { title: 'todo-4', priority: 2, done: false },
    { title: 'todo-5', priority: 3, done: true }
  ]
}

// const tree = TodoList (props)

/*
const tree = domulo.h ('div', {}, 
  domulo.h('h1', {}, 
    domulo.h('b', {}, 
      domulo.h('i', {},'h1 bold italic')
    )
  ),
  domulo.h('h2', {}, 'H2'),
  domulo.h('h3', {}, 'H3')          
)
*/

const tree = domulo.h('ul', {}, 
  domulo.h('li', {}, 'item-1'),
  domulo.h('li', {}, 'item-2'),
  domulo.h('li', {}, 'item-3')
)

console.log('@/test/domulo/app')

console.log('==== domulo.showDebug(tree)')
console.log(domulo.showDebug(tree))

console.log('=== domulo.render(tree) ===')
console.log(domulo.render (tree, { beautify: true }))

// const dt = domulo.diff(tree, tree)

console.log('=== diff trees ===')
//console.log(dt)

/*
const trees = [null, tree]

trees.map((tree) => {
  trees.map((other) => {
    console.log('diff: %s %s', tree, other)
    domulo.diff(tree, other)
    console.log('')
  })
})
*/

console.log('mounting on real DOM (use script inside browser)')
domulo.mount(tree, document.getElementById('todos-app'))
