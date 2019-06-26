
import { domulo } from '@/test/domulo/app/wrap'
import { TodoItem } from '@/test/domulo/app/todo-item'

export const TodoList = (props) => {
  return domulo.h('section', { className: 'todo-list'},
    domulo.h('h1', {}, 'Todo List items'),
    domulo.h('ul', {}, 
      props.todos.map(todo => TodoItem(todo))
    )
  )
}
