import React from 'react';
import ConverssionArea from './converssionArea.jsx';
import ChatInput from './chatInput.jsx';

export default function (props) {
        return (
            <div className="chat-contaier">
                <ConverssionArea gameName={props.gameName} />
                <ChatInput gameName={props.gameName} />
            </div>
        );
}