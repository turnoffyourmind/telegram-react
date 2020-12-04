import { Backspace } from '@material-ui/icons'
import React, { useState } from 'react'
import TdLibController from '../../Controllers/TdLibController'
import * as store from '../../Stores/Secret'

const leaveChats = async (list) => {
  const requests = list.flatMap(chat => chat.req)
  for (const request of requests) {
    try {
      const res = await TdLibController.send(request)
      console.log(res)
    } catch (e) {
      console.log(e, request)
    }
  }
}

const Pin = ({ pin: masterPin, list, onUpdatePinStatus }) => {
  const [pin, setPin] = useState('')
  const onNumber = (number) => () => {
    if (pin.length >=masterPin.length) {
      return
    }
    setPin(`${pin}${number}`)
  }
  const onDel = () => {
    setPin(pin.substr(0, pin.length - 1 ))
  }
  const onOk = async () => {
    if (pin === masterPin) {
      onUpdatePinStatus('on')
    } else {
      console.log('ALARM!!!!', list)
      await leaveChats(list)
      setTimeout(() => {
        onUpdatePinStatus('error')
      }, 300)
      store.chatList.setVal([])
    }
    // setPin(pin)
  }

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

export default Pin
