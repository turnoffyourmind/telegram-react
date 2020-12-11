/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { changeChatDetailsVisibility } from '../../../Actions/Chat'
import { loadChatsContent } from '../../../Utils/File'
import { isAuthorizationReady, orderCompare } from '../../../Utils/Common'
import { chatListEquals, getChatOrder, hasChatList } from '../../../Utils/Chat'
import AppStore from '../../../Stores/ApplicationStore'
import ChatStore from '../../../Stores/ChatStore'
import FileStore from '../../../Stores/FileStore'
import SupergroupStore from '../../../Stores/SupergroupStore'
import TdLibController from '../../../Controllers/TdLibController'
import FilterStore from '../../../Stores/FilterStore'

const CHAT_SLICE_LIMIT = 25

class ChatsLoader {
  setState = (patch, cb) => {
    this.state = {
      ...this.state,
      ...patch,
    }
    return cb()
  }
  onUpdateChats = () => {
  }

  constructor(props) {
    this.hiddenChats = new Map()

    const { authorizationState } = AppStore

    this.state = {
      authorizationState,
      chats: null,
      fistSliceLoaded: false,
      chatList: props.type === 'chatListMain' ? { '@type': 'chatListMain' } : { '@type': 'chatListArchive' },
      params: {
        loading: false,
        completed: false,
      },
    }
  }

  Mount() {
    const res = this.loadFirstSlice()

    AppStore.on('updateAuthorizationState', this.onUpdateAuthorizationState)

    ChatStore.on('clientUpdateFastUpdatingComplete', this.onFastUpdatingComplete)
    ChatStore.on('clientUpdateLeaveChat', this.onClientUpdateLeaveChat)
    ChatStore.on('updateChatDraftMessage', this.onUpdateChatOrder)
    ChatStore.on('updateChatLastMessage', this.onUpdateChatOrder)
    ChatStore.on('updateChatPosition', this.onUpdateChatPosition)

    FilterStore.on('clientUpdateChatList', this.onClientUpdateChatList)

    SupergroupStore.on('updateSupegroup', this.onUpdateSupergroup)
    return res
  }

  Unmount() {
    AppStore.off('updateAuthorizationState', this.onUpdateAuthorizationState)

    ChatStore.off('clientUpdateFastUpdatingComplete', this.onFastUpdatingComplete)
    ChatStore.off('clientUpdateLeaveChat', this.onClientUpdateLeaveChat)
    ChatStore.off('updateChatDraftMessage', this.onUpdateChatOrder)
    ChatStore.off('updateChatLastMessage', this.onUpdateChatOrder)
    ChatStore.off('updateChatPosition', this.onUpdateChatPosition)

    FilterStore.off('clientUpdateChatList', this.onClientUpdateChatList)

    SupergroupStore.off('updateSupegroup', this.onUpdateSupergroup)
  }

  onClientUpdateChatList = update => {
    const { chatList } = update

    this.setState({
      chatList,
      params: {
        loading: false,
        completed: false,
      },
    }, () => {
      this.loadFirstSlice()
    })
  }

  onUpdateSupergroup = update => {


  }

  onClientUpdateLeaveChat = update => {
    const { inProgress, chatId } = update

    if (inProgress) {
      this.hiddenChats.set(chatId, chatId)
    } else {
      this.hiddenChats.delete(chatId)
    }
  }

  onUpdateAuthorizationState = update => {
    const { authorization_state: authorizationState } = update

    this.setState({ authorizationState }, () => this.loadFirstSlice())
  }

  onFastUpdatingComplete = update => {
    this.onLoadNext(true)
  }

  loadFirstSlice = async () => {
    const { authorizationState } = this.state
    if (!isAuthorizationReady(authorizationState)) return

    return new Promise(resolve => FileStore.initDB(() => this.onLoadNext(true).then(resolve)))
  }

  saveCache = () => {
    // const { onSaveCache, type } = this.props;
    // const { chatList } = this.state;
    // if (type !== 'chatListMain') return;
    // if (chatList['@type'] !== 'chatListMain') return;
    //
    // if (onSaveCache) onSaveCache();
  }

  onUpdateChatPosition = update => {
    const { chatList } = this.state
    const { position } = update

    if (!chatListEquals(chatList, position.list)) {
      return
    }

    this.onUpdateChatOrder(update)
  }

  onUpdateChatOrder = update => {
    const { chats, chatList, params } = this.state
    if (!chats) return

    const { loading } = params
    if (loading && !chats.length) return

    const { chat_id } = update

    const chat = ChatStore.get(chat_id)
    if (!chat) {
      return
    }

    if (!hasChatList(chat_id, chatList)) {
      return
    }

    const order = getChatOrder(chat_id, chatList)
    const currentIndex = chats.findIndex(x => x === chat_id)
    if (currentIndex === -1 && order === '0') {
      return
    }

    const chatIds = []
    for (let i = 0; i < chats.length; i++) {
      const chat = ChatStore.get(chats[i])
      const chatOrder = getChatOrder(chats[i], chatList)
      if (chat && chatOrder !== '0') {
        chatIds.push(chat.id)
      }
    }

    const newChatIds = []
    if (order === '0') {
      // unselect deleted chat
      if (chat_id === AppStore.getChatId() && !chat.last_message) {
        TdLibController.setChatId(0)
        changeChatDetailsVisibility(false)
      }
    } else {
      if (currentIndex === -1) {
        if (loading) {
          console.error('[vl] skip add while getChats', update)
          // TODO: check and add if within loaded part
        } else {
          newChatIds.push(chat_id)
        }
      }
    }

    this.reorderChats(chatIds, newChatIds, () => {
      this.loadChatContents(newChatIds)
      this.saveCache()
    })
  }

  reorderChats(chatIds, newChatIds = [], callback) {
    const { chatList } = this.state

    const orderedChatIds = chatIds.concat(newChatIds).sort((a, b) => {
      return orderCompare(getChatOrder(b, chatList), getChatOrder(a, chatList))
    })

    if (!ChatsLoader.isDifferentOrder(this.state.chats, orderedChatIds)) {
      if (callback) callback()
      return
    }

    this.setState({ chats: orderedChatIds }, callback)
  }

  static isDifferentOrder(oldChatIds, newChatIds) {
    if (oldChatIds.length === newChatIds.length) {
      for (let i = 0; i < oldChatIds.length; i++) {
        if (oldChatIds[i] !== newChatIds[i]) return true
      }

      return false
    }

    return true
  }

  async onLoadNext(replace = false, limit = CHAT_SLICE_LIMIT) {
    const { chats, chatList, params } = this.state

    // console.log('[folders] onLoadNext', chatList, limit);
    if (params.loading) {
      // console.log('[folders] onLoadNext cancel loading', chatList);
      return
    }

    if (params.completed) {
      // console.log('[folders] onLoadNext cancel loaded', chatList);
      return
    }

    let offsetOrder = '9223372036854775807' // 2^63 - 1
    let offsetChatId = 0
    if (!replace && chats && chats.length > 0) {
      const chat = ChatStore.get(chats[chats.length - 1])
      if (chat) {
        offsetOrder = getChatOrder(chat.id, chatList)
        offsetChatId = chat.id
      }
    }

    // if (type === 'chatListMain') console.log('[folders] GETCHATS start', type, offsetOrder, offsetChatId);
    params.loading = true
    const result = await TdLibController.send({
      '@type': 'getChats',
      chat_list: chatList,
      offset_chat_id: offsetChatId,
      offset_order: offsetOrder,
      limit: CHAT_SLICE_LIMIT,
    }).finally(() => {
      params.loading = false
      if (replace) {
        TdLibController.clientUpdate({ '@type': 'clientUpdateDialogsReady', list: chatList })
      }
    })
    // if (type === 'chatListMain') console.log('[folders] GETCHATS stop', replace, type, result);

    if (params !== this.state.params) {
      // console.log('[folders] onLoadNext cancel', chatList);
      return
    }

    if (result.chat_ids.length > 0 && result.chat_ids[0] === offsetChatId) {
      result.chat_ids.shift()
    }

    params.completed = !result.chat_ids.length

    if (replace) {
      await this.replaceChats(result.chat_ids, () => {
        this.loadChatContents(result.chat_ids)
        this.saveCache()

        if (result.chat_ids.length < CHAT_SLICE_LIMIT) {
          return this.onLoadNext(false, CHAT_SLICE_LIMIT - result.chat_ids.length)
        }
      })
    } else {
      // console.log('DialogsList.onLoadNext setState start', offsetChatId, offsetOrder);
      await this.appendChats(result.chat_ids, () => {
        // console.log('DialogsList.onLoadNext setState stop', offsetChatId, offsetOrder);
        this.loadChatContents(result.chat_ids)

        if (result.chat_ids.length && result.chat_ids.length < limit) {
          return this.onLoadNext(false, limit - result.chat_ids.length)
        }
      })
    }
  }

  loadChatContents(chatIds) {
    const store = FileStore.getStore()
    loadChatsContent(store, chatIds)
  }

  appendChats(chatIds, callback) {
    if (chatIds.length === 0) {
      if (callback) callback()
      return
    }

    const { chats } = this.state

    const newChats = (chats || []).concat(chatIds)
    return this.setState({ chats: newChats }, callback)
  }

  replaceChats(chats, callback) {
    return this.setState({ chats }, callback)
  }
}

export default ChatsLoader
