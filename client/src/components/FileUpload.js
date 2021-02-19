import React, { Fragment, useState } from 'react';
import Message from './Message'
import Progress from './Progress'
import axios from 'axios';
import XLSX from 'xlsx';

export const FileUpload = () => {
    //file handling
    const [file, setFile] = useState('');
    const [filename, setFilename] = useState('Choose File');
    //server is sending back object, so this is an object
    const [uploadedFile, setUploadedFile] = useState({});

    //error handling
    const [message, setMessage] = useState('');
    const [errorPresent, setErrorPresent] = useState(false);
    const [preventSubmitError, setPreventSubmitError] = useState(false);

    //upload %
    const [uploadPercent, setUploadPercent] = useState(0);

    const [items, setItems] = useState([])

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
            // set the errors and make sure that a 'File not found' error doesn't overwrite file type error
            setMessage('Please select an excel file');
            setErrorPresent(true);
            setPreventSubmitError(true);
        }
    }

    const onSubmit = async e => {
        e.preventDefault();
        const file = e.target.files[0];
        readExcel(file);
        // setUploadPercent(0);
        // const formData = new FormData();
        // //append it to file in backend
        // formData.append('file', file);

        // try {
        //     const res = await axios.put('/upload', formData, {
        //         headers: {
        //             'Content-Type': 'multipart/form-data'
        //         },
        //         onUploadProgress: progressEvent => {
        //             setUploadPercent(
        //                 parseInt(
        //                     Math.round((progressEvent.loaded * 100) / progressEvent.total)
        //                 )
        //             )
        //             //Clear percentage
        //             setTimeout(() => setUploadPercent(0), 4000);
        //         }


        //     });

        //     const { fileName, filePath } = res.data;

        //     setUploadedFile({ fileName, filePath });
        //     setMessage('File Successfully Uploaded')
        // }
        // catch (err) {
        //     if (err.response.status === 500) {
        //         setMessage('There was a problem with the server');
        //         setErrorPresent(true);
        //     }
        //     else {
        //         if (!preventSubmitError) {
        //             setMessage(err.response.data.msg);
        //             setErrorPresent(true);
        //         }
        //     }
        // };
    }


    const checkCOR_INT = (data) => {
        var passed = true;

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var companyData = data[i];
            const dataKeys = Object.keys(data[0]);
            console.log(dataKeys);
            
            //check name, address, city, state
            const alphanum = /^[A-Za-z\d ]{1,50}$/g;
            for (var k = 0; k < 4; k++){
                var key = dataKeys[k];
                var valueToCheck = companyData[key];
                passed = valueToCheck.match(alphanum);
                if(passed){
                    console.log(key + " correct");
                }
                else{
                    console.log(key + " incorrect");
                }
            }

            //check ZIP, EIN
            const nineDigitCheck = 100000000;

            var zip = companyData[dataKeys[4]];
            passed = typeof zip == "number" && Number.isInteger(zip) && zip/nineDigitCheck < 10;
            if(passed){
                console.log("zip correct");
            }
            else{
                console.log("zip incorrect");
            }

            var ein = companyData[dataKeys[5]];
            passed = typeof ein == "number" && Number.isInteger(ein) && ein/nineDigitCheck < 10 && ein/nineDigitCheck >= 1;
            if(passed){
                console.log("ein correct");
            }
            else{
                console.log("ein incorrect");
            }

            //check interest
            var interest = companyData[dataKeys[6]];
            if(typeof interest == "number"){
                console.log("interest correct");
            }
            else{
                console.log("interest incorrect");
            }
        }

    }

    const readExcel = (file) => {
        const promise = new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);

            fileReader.onload = (e) => {
                const bufferArray = e.target.result;
                const workbook = XLSX.read(bufferArray, { type: 'buffer' })
                const worksheetName = workbook.SheetNames[0]
                const worksheet = workbook.Sheets[worksheetName];
                const data = XLSX.utils.sheet_to_json(worksheet)

                resolve(data);
            };

            fileReader.onerror = (err) => {
                setMessage(err.response.data.msg);
                setErrorPresent(true);
                reject(err)
            }
        });

        promise.then((data) => {
            checkCOR_INT(data);
        })
    }

    // <form onSubmit={onSubmit}>
    //             <div className="custom-file mb-4">
    //                 <input type="file" className="custom-file-input" id="customFile" onChange={onUpload} />
    //                 <label className="custom-file-label" htmlFor="customFile">
    //                     {filename}
    //                 </label>
    //             </div>

    //             <Progress percentage={uploadPercent}/>

    //             <input type="submit" value="Upload" className="btn btn-primary btn-block mt-4" />
    //         </form>

    // <form onSubmit={(e) => {
    //     const file = e.target.files[0];
    //     readExcel(file);
    // }}>
    //     <div className="custom-file">
    //         <input type="file" className="custom-file-input" id="customFile" onChange={onUpload} />
    //         <label className="custom-file-label" htmlFor="customFile">{filename}</label>
    //     </div>
    //     <input type="submit" value="Upload" className="btn btn-primary btn-block mt-4" />
    // </form>

    return (
        <Fragment>
            {message ? <Message msg={message} errPres={errorPresent} /> : null}

            <input type="file" onChange={(e) => {
                const file = e.target.files[0];
                readExcel(file);
            }} />

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
