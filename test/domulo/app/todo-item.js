
import { domulo } from '@/test/domulo/app/wrap'

export const TodoItem = (props) => {
  return domulo.h('li', { className: 'todo-item' },
    domulo.h('p', {}, 
      'tile: ',  domulo.h('span', {}, props.title),
      ' ',
      'status: ', domulo.h('span', {}, props.done)
    )
  )
}
