import React, { Fragment, useState } from 'react';
import Message from './Message'
import axios from 'axios';

export const FileUpload = () => {
    const [file, setFile] = useState('');
    const [filename, setFilename] = useState('Choose File');
    //server is sending back object, so this is an object
    const [uploadedFile, setUploadedFile] = useState({});
    const [message, setMessage] = useState('');
    const [errorPresent, setErrorPresent] = useState(false);
    const [preventSubmitError, setPreventSubmitError] = useState(false);

    const types = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']

    const onUpload = e => {
        const selected = e.target.files[0];
        //if there's a file and it's an allowed type, set file = selected
        if (selected && types.includes(selected.type)) {
            setFile(selected);
            setFilename(selected.name);
            //reset error
            setMessage('');
        }
        //if we have an error
        else {
            //reset the file to null
            setFile(null);
            setMessage('Please select an excel file');
            setErrorPresent(true);
            setPreventSubmitError(true);
        }

        // setFile(e.target.files[0]);
        // setFilename(e.target.files[0].name);
        // console.log("on upload");
    }

    const onSubmit = async e => {
        e.preventDefault();
        const formData = new FormData();
        //append it to file in backend
        formData.append('file', file);

        try {
            const res = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const { fileName, filePath } = res.data;

            setUploadedFile({ fileName, filePath });
            setMessage('File Successfully Uploaded')
        }
        catch (err) {
            if (err.response.status === 500) {
                setMessage('There was a problem with the server');
                setErrorPresent(true);
            }
            else {
                if (!preventSubmitError) {
                    setMessage(err.response.data.msg);
                    setErrorPresent(true);
                }
            }
        };
    }

    return (
        <Fragment>
            {message ? <Message msg={message} errPres={errorPresent} /> : null}
            <form onSubmit={onSubmit}>
                <div className="custom-file mb-4">
                    <input type="file" className="custom-file-input" id="customFile" onChange={onUpload} />
                    <label className="custom-file-label" htmlFor="customFile">
                        {filename}
                    </label>
                </div>

                <input type="submit" value="Upload" className="btn btn-primary btn-block mt-4" />
            </form>
            { uploadedFile ?
                (<div className="row mt-5">
                    <div className="col-md-6 m-auto">
                        <h3 className="text-center">{uploadedFile.fileName}</h3>
                    </div>
                </div>) :
                null
            }
        </Fragment>
    )
}

export default FileUpload
