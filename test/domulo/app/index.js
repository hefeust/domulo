
// first of all, include the lib wrapper with ket-initialization code
import { domulo } from "@/test/domulo/app/wrap"

// then include your functional components/widgets
import { TodoList } from '@/test/domulo/app/todo-list'
import { TodoItem } from '@/test/domulo/app/todo-item'

const root = document.getElementById('todos-app')

const tree1 = domulo.h('section', {},
  domulo.h ('h2', {}, 'h1-1'),
  domulo.h('ul', {}, 
    domulo.h('li', {}, 'li-1-1'),
    domulo.h('li', {}, 'li-1-2')
  )
)

const tree2 = domulo.h('section', {},
  domulo.h('ul', {}, 
    domulo.h('li', {}, 'li-2-1'),
    domulo.h('li', {}, 'li-2-2')
  ),
  domulo.h ('h2', {}, 'h1-2')
)


console.log('@/test/domulo/app')

console.log('==== domulo.showDebug(tree)')
console.log(domulo.showDebug(tree1))
console.log(domulo.showDebug(tree2))

console.log('=== domulo.render(tree) string representation ===')
console.log ('tree 1')
console.log(domulo.render (tree1, { beautify: true }))
console.log ('tree 2')
console.log(domulo.render (tree2, { beautify: true }))

console.log('=== diff trees ===')

console.log('mounting on real DOM (use script inside browser)')
domulo.mount(tree1, root)

let patch = domulo.diff (tree1, tree2)

domulo.patch (patch, root)