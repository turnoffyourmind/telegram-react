import { DeleteForever } from '@material-ui/icons'
import React from 'react'

const SelectedItem = ({ list, chatId, onSelect, children, style }) => {
  const toggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect(chatId)
  }
  return (
    <div className='selectedItem_root' onClickCapture={toggle} style={style}>
      <div style={{ pointerEvents: 'none' }}>{children}</div>
      {list.includes(chatId) ? <DeleteForever/> : null}
    </div>
  )
}
export default SelectedItem
