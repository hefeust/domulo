
import { domulo } from '@/test/domulo/app/wrap'

export const TodoItem = (props) => {
  return domulo.h('li', { 
      className: 'todo-item' ,
      style: `background-color:${props.idx % 2 ? '#aaa': '#eee'};`
    },
    domulo.h('p', {},
      '#' + props.idx + ' ',
      'tile: ',  domulo.h('span', {}, props.title),
      ' ',
      'status: ', domulo.h('span', {}, props.done)
    )
  )
}
