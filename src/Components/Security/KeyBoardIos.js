import withTheme from '@material-ui/core/styles/withTheme'
import { Backspace } from '@material-ui/icons'
import cn from 'classnames'
import React from 'react'
import './KeyBoardIos.css'
import { compose } from '../../Utils/HOC'

const KeyBoardIos = ({ pin, onNumber, onDel, onOk, theme, size }) => {
  var w = window.innerWidth * 0.9;
  const boxStyle = {
    width: w,
  }
  const btn = {
    width: w/4.3,
    height: w/4.3,
  }

  const textElements = [...pin.replace(/./g, '●'), ...Array(size - pin.length).fill('○').join('')]
    .map(t => <div className='ios_pin_text_item'>{t}</div>)


  const rootCN = cn('ios_pin_root', theme.palette.type === 'dark' ? 'ios_pin_dark' : 'ios_pin_light')
  return (
    <div className={rootCN}>
      <div style={boxStyle}>
        <div className='ios_pin_text'>
          {textElements}
        </div>
        <div className='ios_pin_row'>
          <div className='ios_pin_number' style={btn} onClick={onNumber(1)}>
            <div>1</div>
            <div className='ios_pin_alf'>&nbsp;</div>
          </div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(2)}>
            <div>2</div>
            <div className='ios_pin_alf'>ABC</div>
          </div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(3)}>
            <div>3</div>
            <div className='ios_pin_alf'>DEF</div>
          </div>
        </div>
        <div className='ios_pin_row'>
          <div className='ios_pin_number' style={btn} onClick={onNumber(4)}>
            <div>4</div>
            <div className='ios_pin_alf'>GHI</div>
          </div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(5)}>
            <div>5</div>
            <div className='ios_pin_alf'>JKL</div>
          </div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(6)}>
            <div>6</div>
            <div className='ios_pin_alf'>NMO</div>
          </div>
        </div>
        <div className='ios_pin_row'>
          <div className='ios_pin_number' style={btn} onClick={onNumber(7)}>
            <div>7</div>
            <div className='ios_pin_alf'>PQRS</div>
          </div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(8)}>
            <div>8</div>
            <div className='ios_pin_alf'>TUV</div>
          </div>
          <div className='ios_pin_number' style={btn} onClick={onNumber(9)}>
            <div>9</div>
            <div className='ios_pin_alf'>WXYZ</div>
          </div>
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

const enhance = compose(
  withTheme
);

export default enhance(KeyBoardIos)
