
// first of all, include the lib wrapper with ket-initialization code
import { domulo } from "@/test/domulo/app/wrap"

// then include your functional components/widgets
import { TodoList } from '@/test/domulo/app/todo-list'
import { TodoItem } from '@/test/domulo/app/todo-item'

// feed some data...
const props = {
  todos:  [
    { title: 'todo-1', priority: 1, done: false },
    { title: 'todo-2', priority: 5, done: false },
    { title: 'todo-3', priority: 4, done: true },
    { title: 'todo-4', priority: 2, done: false },
    { title: 'todo-5', priority: 3, done: true }
  ]
}

// build the VDOM tree...
const tree = TodoList (props)

const tree1 = domulo.h('ul', {}, 
  domulo.h('li', {}, 'item-1'),
  domulo.h('li', {}, 'item-2'),
  domulo.h('li', {}, 'item-3')
)

console.log('@/test/domulo/app')

console.log('==== domulo.showDebug(tree)')
console.log(domulo.showDebug(tree))

console.log('=== domulo.render(tree) string representation ===')
console.log(domulo.render (tree, { beautify: true }))

console.log('=== diff trees ===')

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
