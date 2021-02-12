import React, { Fragment, useState } from 'react';
import axios from 'axios';

export const FileUpload = () => {
    const [file, setFile] = useState('');
    const [filename, setFilename] = useState('Choose File');
    //server is sending back object, so this is an object
    const [uploadedFile, setUploadedFile] = useState({});

    const onUpload = e => {
        setFile(e.target.files[0]);
        setFilename(e.target.files[0].name);
        console.log("on upload");
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
            console.log("on submit");
        }
        catch (err) {
            if (err.response.status === 500) {
                console.log('There was a problem with the server');
            }
            else {
                console.log(err.response.data.msg);
            }
        };
    }

    return (
        <Fragment>
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
