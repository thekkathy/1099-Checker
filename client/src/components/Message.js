import React, { Fragment } from 'react'

const Message = ({ message, allPassed }) => {
    const errorLog = (
        <Fragment>
            {message ? 
                message.map(reqs => (
                <div className="card mb-3 p-2" key={reqs.label}>
                    <strong className="card-title text-danger">Error with {reqs.label}</strong>
                    <div className="card-text">{reqs.passes}</div>
                </div>
            )) :
                <strong>No file to check</strong>
            }
        </Fragment>
    );

    return (
        <div className="container">
            <div className="card p-3">
            <div className="card-title mx-auto lead">Errors: </div>
                <div className="card-body mx-auto">
                    {allPassed && message ? <strong className="container text-success">No errors found!</strong> : <div>{errorLog}</div>}
                    {!allPassed && !message && <strong className="container text-danger">Check error message above</strong>}
                </div>
            </div>
        </div>
    )
}

export default Message
