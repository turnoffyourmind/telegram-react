import withTheme from '@material-ui/core/styles/withTheme'
import { Backspace } from '@material-ui/icons'
import logo from '../../Assets/Icons/logo.png'
import React from 'react'
import cn from 'classnames'
import { compose } from '../../Utils/HOC'

const KeyBoardCommon = ({ pin, onNumber, onDel, onOk, theme }) => {
  const rootCN = cn('security_pin_root', theme.palette.type === 'dark' ? 'security_pin_dark' : 'security_pin_light')


  const textElements = [...pin.replace(/./g, '●')]
    .map(t => <div className='security_pin_text_item'>{t}</div>)
  return (
    <div className={rootCN}>
      <img src={logo} className='security_pin_logo' />
      <div className='security_pin_text'>
        {textElements}
      </div>
      <div className='security_pin_row'>
        <div className='security_pin_number' onClick={onNumber(1)}>
          <div>1</div>
          <div className='security_pin_alf'>&nbsp;</div>
        </div>
        <div className='security_pin_number' onClick={onNumber(2)}>
          <div>2</div>
          <div className='security_pin_alf'>ABC</div>
        </div>
        <div className='security_pin_number' onClick={onNumber(3)}>
          <div>3</div>
          <div className='security_pin_alf'>DEF</div>
        </div>
      </div>
      <div className='security_pin_row'>
        <div className='security_pin_number' onClick={onNumber(4)}>
          <div>4</div>
          <div className='security_pin_alf'>GHI</div>
        </div>
        <div className='security_pin_number' onClick={onNumber(5)}>
          <div>5</div>
          <div className='security_pin_alf'>JKL</div>
        </div>
        <div className='security_pin_number' onClick={onNumber(6)}>
          <div>6</div>
          <div className='security_pin_alf'>NMO</div>
        </div>
      </div>
      <div className='security_pin_row'>
        <div className='security_pin_number' onClick={onNumber(7)}>
          <div>7</div>
          <div className='security_pin_alf'>PQRS</div>
        </div>
        <div className='security_pin_number' onClick={onNumber(8)}>
          <div>8</div>
          <div className='security_pin_alf'>TUV</div>
        </div>
        <div className='security_pin_number' onClick={onNumber(9)}>
          <div>9</div>
          <div className='security_pin_alf'>WXYZ</div>
        </div>
      </div>
      <div className='security_pin_row'>
        <div className='security_pin_number' onClick={onDel}>
          <div><Backspace/></div>
          <div className='security_pin_alf'>&nbsp;</div>
        </div>
        <div className='security_pin_number' onClick={onNumber(0)}>
          <div>0</div>
          <div className='security_pin_alf'>+</div>
        </div>
        <div className='security_pin_number' onClick={onOk}>
          <div>OK</div>
          <div className='security_pin_alf'>&nbsp;</div>
        </div>
      </div>
    </div>
  )
}

const enhance = compose(
  withTheme
);


export default enhance(KeyBoardCommon)
