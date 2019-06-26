
import { domulo } from '@/test/domulo/app/wrap'

export const TodoItem = (props) => {
  return domulo.h('li', { className: 'todo-item' },
    domulo.h('p', {}, 
      domulo.h('span', {}, props.title),
      domulo.h('span', {}, props.done)
    )
  )
}
