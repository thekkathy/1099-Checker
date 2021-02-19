import React, { useState } from 'react'
import PropTypes from 'prop-types'

const Message = ({ msg, errPres }) => {

    return (
        <div className={`alert alert-${errPres ? 'danger' : 'info'} alert-dismissible fade show`} role="alert">
            { msg}
            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    )
}

Message.propTypes = {
    msg: PropTypes.string.isRequired, 
    errPres: PropTypes.bool.isRequired
}

export default Message
