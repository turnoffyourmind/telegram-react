/*
 *  Copyright (c) 2018-present, Evgeny Nadymov
 *
 * This source code is licensed under the GPL v.3.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withTranslation } from 'react-i18next';
import ListItem from '@material-ui/core/ListItem';
import ChatTile from './ChatTile';
import DialogTitle from './DialogTitle';
import {
    canAddChatToList,
    isChatArchived,
    isChatMuted,
    isChatPinned,
    isChatSecret,
    isChatUnread,
    isMeChat,
} from '../../../../Utils/Chat';
import {
    addChatToList,
    leaveChat,
    toggleChatIsMarkedAsUnread,
    toggleChatIsPinned,
    toggleChatNotificationSettings
} from '../../../../Actions/Chat';
import { openChat } from '../../../../Actions/Client';
import { viewMessages } from '../../../../Actions/Message';
import ApplicationStore from '../../../../Stores/ApplicationStore';
import ChatStore from '../../../../Stores/ChatStore';
import OptionStore from '../../../../Stores/OptionStore';
import TdLibController from '../../../../Controllers/TdLibController';
import './Dialog.css';

class Dialog extends Component {
    render() {
        const { chatId } = this.props;
        return (
            <div className='dialog-wrapper'>
                <ChatTile chatId={chatId}/>
                <div className='dialog-inner-wrapper'>
                    <div className='tile-first-row'>
                        <DialogTitle chatId={chatId} />
                    </div>
                </div>
            </div>
        );
    }
}

Dialog.propTypes = {
    chatId: PropTypes.number.isRequired,
};

Dialog.defaultProps = {
    hidden: false,
    showSavedMessages: true
};

export default withTranslation()(Dialog);
