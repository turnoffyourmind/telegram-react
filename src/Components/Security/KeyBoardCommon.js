import { Backspace } from '@material-ui/icons'
import React from 'react'

const KeyBoardCommon = ({ pin, onNumber, onDel, onOk }) => {
  return (
    <div className='security_pin_root'>
      <div className='security_pin_text'>
        {pin.replace(/./g, '*')}
      </div>
      <div className='security_pin_row'>
        <div className='security_pin_number' onClick={onNumber(1)}>1</div>
        <div className='security_pin_number' onClick={onNumber(2)}>2</div>
        <div className='security_pin_number' onClick={onNumber(3)}>3</div>
      </div>
      <div className='security_pin_row'>
        <div className='security_pin_number' onClick={onNumber(4)}>4</div>
        <div className='security_pin_number' onClick={onNumber(5)}>5</div>
        <div className='security_pin_number' onClick={onNumber(6)}>6</div>
      </div>
      <div className='security_pin_row'>
        <div className='security_pin_number' onClick={onNumber(7)}>7</div>
        <div className='security_pin_number' onClick={onNumber(8)}>8</div>
        <div className='security_pin_number' onClick={onNumber(9)}>9</div>
      </div>
      <div className='security_pin_row'>
        <div className='security_pin_number' onClick={onDel}><Backspace/></div>
        <div className='security_pin_number' onClick={onNumber(0)}>0</div>
        <div className='security_pin_number' onClick={onOk}>OK</div>
      </div>
    </div>
  )
}

export default KeyBoardCommon
