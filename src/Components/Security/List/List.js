/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import CSSTransition from 'react-transition-group/CSSTransition';

import Search from './Search/Search';
import DialogsHeader from './DialogsHeader';
import DialogsList from './DialogsList';

import { openChat } from '../../../Actions/Client';
import { getArchiveTitle } from '../../../Utils/Archive';
import { loadChatsContent } from '../../../Utils/File';
import { duration } from '@material-ui/core/styles/transitions';
import { CHAT_SLICE_LIMIT } from '../../../Constants';
import AppStore from '../../../Stores/ApplicationStore';
import CacheStore from '../../../Stores/CacheStore';
import ChatStore from '../../../Stores/ChatStore';
import FileStore from '../../../Stores/FileStore';
import FilterStore from '../../../Stores/FilterStore';
import TdLibController from '../../../Controllers/TdLibController';

const defaultTimeout = {
  enter: duration.enteringScreen,
  exit: duration.leavingScreen
};

class Dialogs extends Component {
  constructor(props) {
    super(props);

    this.dialogListRef = React.createRef();
    this.archiveListRef = React.createRef();
    this.dialogsHeaderRef = React.createRef();

    this.state = {
      cache: null,

      showArchive: false,
      archiveTitle: null,

      mainItems: [],

      timeout: defaultTimeout,
      openSearch: false,

      searchChatId: 0,
      searchText: null,
      query: null
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      cache,
      showArchive,
      archiveTitle,
      mainItems,
      openSearch,
      searchChatId,
      searchText
    } = this.state;

    if (nextState.cache !== cache) {
      return true;
    }

    if (nextState.showArchive !== showArchive) {
      return true;
    }

    if (nextState.archiveTitle !== archiveTitle) {
      return true;
    }

    if (nextState.mainItems !== mainItems) {
      return true;
    }

    if (nextState.openSearch !== openSearch) {
      return true;
    }

    if (nextState.searchChatId !== searchChatId) {
      return true;
    }

    if (nextState.searchText !== searchText) {
      return true;
    }
    if (nextProps.list !== this.props.list) {
      return true;
    }

    return false;
  }

  componentDidMount() {
    this.loadCache();

    AppStore.on('clientUpdateSearchChat', this.onClientUpdateSearchChat);
    AppStore.on('clientUpdateThemeChange', this.onClientUpdateThemeChange);
    AppStore.on('clientUpdatePageWidth', this.onClientUpdatePageWidth);
    ChatStore.on('updateChatDraftMessage', this.onUpdateChatOrder);
    ChatStore.on('updateChatLastMessage', this.onUpdateChatOrder);
    ChatStore.on('updateChatPosition', this.onUpdateChatOrder);
    ChatStore.on('clientUpdateSettings', this.onClientUpdateSettings);
    ChatStore.on('clientUpdateArchive', this.onClientUpdateArchive);
    ChatStore.on('clientUpdateContacts', this.onClientUpdateContacts);
    ChatStore.on('clientUpdateNewGroup', this.onClientUpdateNewGroup);
    ChatStore.on('clientUpdateNewChannel', this.onClientUpdateNewChannel);
    FilterStore.on('updateChatFilters', this.onUpdateChatFilters);
  }

  componentWillUnmount() {
    AppStore.off('clientUpdateSearchChat', this.onClientUpdateSearchChat);
    AppStore.off('clientUpdateThemeChange', this.onClientUpdateThemeChange);
    AppStore.off('clientUpdatePageWidth', this.onClientUpdatePageWidth);
    ChatStore.off('updateChatDraftMessage', this.onUpdateChatOrder);
    ChatStore.off('updateChatLastMessage', this.onUpdateChatOrder);
    ChatStore.off('updateChatPosition', this.onUpdateChatOrder);
    ChatStore.off('clientUpdateSettings', this.onClientUpdateSettings);
    ChatStore.off('clientUpdateArchive', this.onClientUpdateArchive);
    ChatStore.off('clientUpdateContacts', this.onClientUpdateContacts);
    ChatStore.off('clientUpdateNewGroup', this.onClientUpdateNewGroup);
    ChatStore.off('clientUpdateNewChannel', this.onClientUpdateNewChannel);
    FilterStore.off('updateChatFilters', this.onUpdateChatFilters);
  }

  onUpdateChatFilters = () => {
    this.handleSaveCache();
  };

  onClientUpdatePageWidth = update => {
    const { isSmallWidth } = update;

    if (!isSmallWidth) return;

    const { openSearch, } = this.state;
    if (openSearch) {
      this.setState({
        openSearch: false,
        timeout: 0
      }, () => {
        this.setState({
          timeout: defaultTimeout
        });
      });
    }
  };

  async loadCache() {
    const cache = (await CacheStore.load()) || {};

    const { chats, archiveChats } = cache;

    FilterStore.filters = FilterStore.filters || CacheStore.filters;
    this.setState({
      cache,

      showArchive: archiveChats && archiveChats.length > 0,
      archiveTitle: getArchiveTitle()
    });

    this.loadChatContents((chats || []).map(x => x.id));

    TdLibController.clientUpdate({
      '@type': 'clientUpdateCacheLoaded'
    });
  }

  async saveCache() {
    const promises = [];
    promises.push(TdLibController.send({
      '@type': 'getChats',
      chat_list: { '@type': 'chatListMain' },
      offset_order: '9223372036854775807',
      offset_chat_id: 0,
      limit: CHAT_SLICE_LIMIT
    }));
    promises.push(TdLibController.send({
      '@type': 'getChats',
      chat_list: { '@type': 'chatListArchive' },
      offset_order: '9223372036854775807',
      offset_chat_id: 0,
      limit: CHAT_SLICE_LIMIT
    }));
    const [mainChats, archiveChats] = await Promise.all(promises);

    const { filters } = FilterStore;

    CacheStore.save(filters, mainChats.chat_ids, archiveChats.chat_ids);
  }

  onUpdateChatOrder = () => {
    const { showArchive: prevShowArchive } = this.state;

    const { current: mainCurrent } = this.dialogListRef;
    if (mainCurrent && mainCurrent.loading) {
      return;
    }

    const { current: archiveCurrent } = this.archiveListRef;
    if (archiveCurrent && archiveCurrent.loading) {
      return;
    }

    const archiveList = ChatStore.chatList.get('chatListArchive');
    const showArchive = archiveList && archiveList.size > 0;

    this.setState({ showArchive, archiveTitle: getArchiveTitle() }, () => {
      if (!prevShowArchive && showArchive) {
        const { current } = this.dialogListRef;
        if (current.listRef) {
          const { current: listCurrent } = current.listRef;
          if (listCurrent && listCurrent.scrollTop > 0) {
            current.scrollTop += 68;
          }
        }
      }
    });

    if (prevShowArchive && !showArchive) {
      TdLibController.clientUpdate({
        '@type': 'clientUpdateCloseArchive'
      });
    }
  };

  onClientUpdateThemeChange = () => {
    this.forceUpdate();
  };

  onClientUpdateSearchChat = update => {
    const { isSmallWidth } = AppStore;
    if (isSmallWidth) return;

    const { chatId, query } = update;
    const { openSearch, searchChatId, searchText } = this.state;

    if (openSearch && chatId === searchChatId && query === searchText) {
      return;
    }

    const header = this.dialogsHeaderRef.current;
    this.setState(
      {
        openSearch: true,
        searchChatId: chatId,
        searchText: null,
      },
      () => {
        if (header) {
          header.setInitQuery(query);
        }
      }
    );
  };

  handleHeaderClick = () => {
    this.dialogListRef.current.scrollToTop();
  };

  handleSearch = visible => {
    this.setState({
      openSearch: visible,
      searchChatId: 0,
      searchText: null
    });
  };

  toggleChat = (chatId) => {
    const { list, setList } = this.props
    let newList
    if (list.includes(chatId)) {
      newList = list.filter(id => id !== chatId)
    } else {
      newList = [...list, chatId]
    }
    setList(newList)
  }
  onSelectChat = this.toggleChat

  handleSelectMessage = (chatId) => {
    this.toggleChat(chatId)
    // openChat(chatId, messageId);
    //
    // const searchChatId = openSearch ? this.state.searchChatId : 0;
    // const searchText = openSearch ? this.state.searchText : null;

    // this.setState({
    //   openSearch,
    //   searchChatId,
    //   searchText
    // });
  };

  handleCloseSearch = () => {
    if (!this.state.openSearch) {
      this.props.setOpenList(false)
      return
    }
    this.setState({
      openSearch: false,
      searchChatId: 0,
      searchText: null
    });
  };

  handleSearchTextChange = text => {
    this.setState({
      searchText: text,
      query: null
    });
  };

  handleSaveCache = () => {
    this.saveCache();
  };

  loadChatContents(chatIds) {
    const store = FileStore.getStore();
    loadChatsContent(store, chatIds);
  }

  render() {
    const { list } = this.props
    const {
      cache,
      showArchive,
      archiveTitle,
      mainItems,
      openSearch,
      timeout,
      searchChatId,
      searchText
    } = this.state;

    const mainCacheItems = cache ? cache.chats || [] : null;
    return (
      <>
        <div className='dialogs'>
          <div className='sidebar-page'>
            <DialogsHeader
              ref={this.dialogsHeaderRef}
              openSearch={openSearch}
              timeout={timeout !== 0}
              onClick={this.handleHeaderClick}
              onSearch={this.handleSearch}
              onCloseSearch={this.handleCloseSearch}
              onSearchTextChange={this.handleSearchTextChange}
            />
            <div className='dialogs-content'>
              <div className='dialogs-content-internal'>
                <DialogsList
                  type='chatListMain'
                  ref={this.dialogListRef}
                  cacheItems={mainCacheItems}
                  items={mainItems}
                  showArchive={showArchive}
                  archiveTitle={archiveTitle}
                  onSelectChat={this.onSelectChat}
                  open={true}
                  onSaveCache={this.handleSaveCache}
                  list={list}
                />
              </div>
              <CSSTransition
                classNames='search'
                timeout={timeout}
                in={openSearch}
                mountOnEnter={true}
                unmountOnExit={true}>
                <Search
                  chatId={searchChatId}
                  text={searchText}
                  onSelectChat={this.onSelectChat}
                  onClose={this.handleCloseSearch}
                  list={list}
                />
              </CSSTransition>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default Dialogs;
