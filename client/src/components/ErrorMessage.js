import React from 'react'

const ErrorMessage = ({ messages }) => {

    return (
        <div className="container">
            {messages ? messages.map(message => (
                <div className={'alert alert-danger alert-dismissible fade show'} role="alert" key={message}>
                    { message}
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )) : null}
        </div>
    )
}

export default ErrorMessage
