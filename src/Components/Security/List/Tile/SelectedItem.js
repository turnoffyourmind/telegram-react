import { DeleteForever } from '@material-ui/icons'
import React from 'react'
import ChatStore from '../../../../Stores/ChatStore'
import UserStore from '../../../../Stores/UserStore'
import { isChatMember, isCreator } from '../../../../Utils/Chat'

const getRequests = (chatId) => {
  const chat = ChatStore.get(chatId);
  if (!chat) {
    console.warn('no chat for: ', chatId)
    return false
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

const SelectedItem = ({ list, chatId, onSelect, children, style }) => {
  const toggle = (e) => {
    console.log(chatId)
    e.preventDefault()
    e.stopPropagation()
    const req = getRequests(chatId)
    if (!req) {
      return
    }
    onSelect({ id: chatId, req })
  }
  return (
    <div className='selectedItem_root' onClick={toggle} style={style}>
      <div style={{ pointerEvents: 'none' }}>{children}</div>
      {list.some(chat => chat.id === chatId) ? <DeleteForever/> : null}
    </div>
  )
}
export default SelectedItem
