
import { domulo } from "@/test/domulo/app/wrap"
import { TodoList } from '@/test/domulo/app/todo-list'
import { TodoItem } from '@/test/domulo/app/todo-item'

const props = {
  todos:  [
 //   { title: 'todo-1', priority: 1, done: false },
 //   { title: 'todo-2', priority: 5, done: false },
 //   { title: 'todo-3', priority: 4, done: true },
    { title: 'todo-4', priority: 2, done: false },
    { title: 'todo-5', priority: 3, done: true }
  ]
}

const tree = TodoList (props)

console.log('@/test/domulo/app')

console.log('==== domulo.showDebug(tree)')
console.log(domulo.showDebug(tree))

console.log('=== domulo.render(tree) ===')
console.log(domulo.render (tree, { beautify: true }))

const dt = domulo.diff(tree, tree)

console.log('diff trees')
console.log(dt)