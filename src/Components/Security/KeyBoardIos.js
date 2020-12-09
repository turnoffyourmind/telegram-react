import { Backspace } from '@material-ui/icons'
import React from 'react'
import './KeyBoardIos.css'

const KeyBoardIos = ({ pin, onNumber, onDel, onOk }) => {
  var w = window.innerWidth * 0.8;
  const boxStyle = {
    width: w,
  }
  const btn = {
    width: w/4,
    height: w/4,
  }
  return (
    <div className='ios_pin_root'>
      <div style={boxStyle}>
        <div className='ios_pin_text'>
          {pin.replace(/./g, '*')}
        </div>
        <div className='ios_pin_row'>
          <div className='ios_pin_number' style={btn} onClick={onNumber(1)}>1</div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(2)}>2</div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(3)}>3</div>
        </div>
        <div className='ios_pin_row'>
          <div className='ios_pin_number' style={btn} onClick={onNumber(4)}>4</div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(5)}>5</div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(6)}>6</div>
        </div>
        <div className='ios_pin_row'>
          <div className='ios_pin_number' style={btn} onClick={onNumber(7)}>7</div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(8)}>8</div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(9)}>9</div>
        </div>
        <div className='ios_pin_row'>
          <div className='ios_pin_number' style={btn} onClick={onDel}><Backspace/></div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(0)}>0</div>
          <div className='ios_pin_number' style={btn} onClick={onOk}>OK</div>
        </div>
      </div>
    </div>
  )
}
export default KeyBoardIos
