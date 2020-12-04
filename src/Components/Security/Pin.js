import { Backspace } from '@material-ui/icons'
import React, { useState } from 'react'
import TdLibController from '../../Controllers/TdLibController'
import ChatStore from '../../Stores/ChatStore'
import UserStore from '../../Stores/UserStore'
import { isChatMember, isCreator } from '../../Utils/Chat'
import * as store from '../../Stores/Secret'


const getRequests = (chatId) => {
  const chat = ChatStore.get(chatId);
  if (!chat) {
    console.warn('no chat for: ', chatId)
    return []
  }

  const requests = [];
  switch (chat.type['@type']) {
    case 'chatTypeBasicGroup': {
      if (isChatMember(chatId)) {
        requests.push({ '@type': 'leaveChat', chat_id: chatId });
      }
      requests.push({ '@type': 'deleteChatHistory', chat_id: chatId, remove_from_chat_list: true });
      break;
    }
    case 'chatTypeSupergroup': {
      if (isCreator(chatId)) {
        requests.push({
          '@type': 'setChatMemberStatus',
          chat_id: chatId,
          user_id: UserStore.getMyId(),
          status: {
            '@type': 'chatMemberStatusCreator',
            is_member: false
          }
        });
      } else if (isChatMember(chatId)) {
        requests.push({ '@type': 'leaveChat', chat_id: chatId });
      }
      break;
    }
    case 'chatTypePrivate':
    case 'chatTypeSecret': {
      requests.push({ '@type': 'deleteChatHistory', chat_id: chatId, remove_from_chat_list: true });
    }
  }
  return requests
}

const leaveChats = async (list) => {
  const requests = list.flatMap(getRequests)
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
