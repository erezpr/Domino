import React from 'react';

export default class converssionArea extends React.Component {
    constructor(args) {
        super(...args);

        this.state = {
            content: []
        };

        this.getChatContent = this.getChatContent.bind(this);
    }

    componentDidMount() {
        this.getChatContent();
    }

    componentWillUnmount() {
            clearTimeout(this.timeoutId);
    }

    render() {
        return (
            <div id="converssion-area-wrpper" ref='converssion'>
                {this.state.content.map((line, index) => (<p key={line.user.name + index}>{line.user.name}:  {line.text}</p>))}
            </div>
        )
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.content.length !== this.state.content.length)
            this.refs.converssion.scrollTop = this.refs.converssion.scrollHeight;
    }

    getChatContent() {
        return fetch(`/chat/${this.props.gameName}`, { method: 'GET', credentials: 'include' })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                this.timeoutId = setTimeout(this.getChatContent, 200);
                return response.json();
            })
            .then(content => {
                this.setState(() => ({ content }));
                if (this.timeoutId && this.props.isGameStart && !this.props.isActive)
                    clearTimeout(this.timeoutId);
            })
            .catch(err => { throw err });
    }
}