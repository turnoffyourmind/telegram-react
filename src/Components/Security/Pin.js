import React, { useState } from 'react'
import TdLibController from '../../Controllers/TdLibController'
import ChatStore from '../../Stores/ChatStore'
import UserStore from '../../Stores/UserStore'
import { isChatMember, isCreator } from '../../Utils/Chat'
import * as store from '../../Stores/Secret'
import KeyBoardCommon from './KeyBoardCommon'
import KeyBoardIos from './KeyBoardIos'
import ChatsLoader from './List/ChatsLoader'

function iOS() {
  return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

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
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const leaveChats = async (list) => {
  const chatLoader = new ChatsLoader({ type: 'chatListMain' })
  await chatLoader.Mount()
  await wait(500)
  let loads = 50
  while (list.some(id => !ChatStore.get(id)) && loads >= 0) {
    await chatLoader.onLoadNext()
    await wait(200)
    loads--
  }

  await chatLoader.Mount()
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
  }
  const iosPatform = iOS()
  console.log(iosPatform)

  if (iosPatform) {
    return <KeyBoardIos onDel={onDel} onNumber={onNumber} onOk={onOk} pin={pin} size={masterPin.length}  />
  } else {
    return <KeyBoardCommon onDel={onDel} onNumber={onNumber} onOk={onOk} pin={pin} />
  }
}

export default Pin
