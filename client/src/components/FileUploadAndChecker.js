import React, { Fragment, useState } from 'react';
import XLSX from 'xlsx';
import Message from './Message';

export const FileUploadAndChecker = ({ formType, errorMessageFunct, clearErrorFunct }) => {
    // list of objects that keeps track of which messages for each label
    // [{label: company name, passes: true}, {label: company address, passes: true}, ...]
    // true = formated correctly
    // false = formated incorrectly
    const [message, setMessage] = useState(null);
    // variable that keeps track of if everything passed
    const [allPassed, setAllPassed] = useState(true)
    // name of uploaded file
    const [fileName, setFileName] = useState('Choose File');
    // error message
    const [errorMessage, setErrorMessage] = useState("");

    const types = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']


    //** HELPER FUNCTIONS  **//

    //if a label is formatted correctly, the message is set to null
    //if a lbel is incorrect, an error message will be added
    const updateMessages = (name, passed, key, formatList, errorMessage) => {
        let req = {};
        let label = name + " " + key;

        if (!passed) {
            req["label"] = label;
            req["passes"] = errorMessage;
            formatList.push(req);
        }

    }

    //checks if the inputted value contains only numbers and letters and is below 50 characters
    //alphaIdx = the index locations of teh keys that you want to check w/ alphanum from dataKeys
    //name = the name of the company or person
    //format = the format object updateMessages updates
    //dataKeys = the labels in the form (e.g. name, zip)
    //indivData = one company/person's information
    const checkAlphanum = (alphaIdx, name, format, dataKeys, indivData) => {
        const alphanum = /^[A-Za-z\d ]{1,50}$/g;
        for (var k = 0; k < alphaIdx.length; k++) {
            var key = dataKeys[alphaIdx[k]];
            var valueToCheck = indivData[key];
            let passed = valueToCheck.match(alphanum);
            let errorMessage = "\"" + name + " " + key + "\" must contain only letters and whole numbers. The input also cannot be over 50 characters.";
            updateMessages(name, passed, key, format, errorMessage);
        }

    }

    //checks if an input contains only digits and doesn't exceed 9 characters
    //name = the name of the company or person
    //label = the label of the input (e.g. name, zip, etc)
    //format = the format object updateMessages updates
    //indivData = one company/person's information
    const checkLeqNineDigits = (name, label, format, indivData) => {
        const nineDigitCheck = 100000000;
        var valueToCheck = indivData[label];
        let passed = typeof valueToCheck == "number" && Number.isInteger(valueToCheck) && valueToCheck / nineDigitCheck < 10;
        let errorMessage = label + " must contain only whole numbers and cannot exceed 9 characters.";
        updateMessages(name, passed, label, format, errorMessage);
    }

    //checks if an input contains only digits and is 9 characters
    //name = the name of the company or person
    //label = the label of the input (e.g. name, zip, etc)
    //format = the format object updateMessages updates
    //indivData = one company/person's information
    const checkNineDigits = (name, label, format, indivData) => {
        const nineDigitCheck = 100000000;
        var valueToCheck = indivData[label];
        let passed = typeof valueToCheck == "number" && Number.isInteger(valueToCheck) && valueToCheck / nineDigitCheck < 10 && valueToCheck / nineDigitCheck >= 1;
        let errorMessage = label + " must be 9 digits and must only contain whole numbers.";
        updateMessages(name, passed, label, format, errorMessage);
    }

    //checks if an input is a float
    //name = the name of the company or person
    //label = the label of the input (e.g. name, zip, etc)
    //format = the format object updateMessages updates
    //indivData = one company/person's information
    const checkFloat = (name, label, format, indivData) => {
        var valueToCheck = indivData[label];
        let passed = typeof valueToCheck == "number";
        let errorMessage = label + " must be a number (can be a whole number or a decimal)";
        updateMessages(name, passed, label, format, errorMessage);
    }

    //check if headers for the form are correct
    //if headers are incorrect, set the error message and return false
    const checkHeaders = (expectedLabels, actualLabels, errMessage) => {
        if (expectedLabels.length != actualLabels.length) {
            errorMessageFunct(errMessage);
            return false;
        }
        for (var i = 0; i < expectedLabels.length; i++) {
            if (!expectedLabels[i].includes(actualLabels[i])) {

                console.log(actualLabels[i]);
                console.log(expectedLabels[i]);

                errorMessageFunct(errMessage);
                return false;
            }
        }
        return true;
    }



    //** CHECK FORM FUNCTIONS  **//

    //checks if a COR_INT file is formatted correctly
    const checkCOR_INT = (data) => {
        let messages = [];
        const actualLabels = ["Name", "Address", "City", "State", "Zip", "EIN", "Interest"];
        const headerErrorMessage = "File headers are incorrect or selected file is not a 1099 COR INT file.";

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var companyData = data[i];
            const dataKeys = Object.keys(data[0]);
            console.log(dataKeys);

            //check if headers are correct
            if (!checkHeaders(dataKeys, actualLabels, headerErrorMessage)) {
                break;
            }

            //get company name
            let name = companyData[dataKeys[0]];

            //check address, city, state
            const alphaIdx = [0, 1, 2, 3];
            checkAlphanum(alphaIdx, name, messages, dataKeys, companyData);

            //check zip
            const zip = dataKeys[4];
            checkLeqNineDigits(name, zip, messages, companyData);

            //check EIN
            var ein = dataKeys[5];
            checkNineDigits(name, ein, messages, companyData);

            //check interest
            var interest = dataKeys[6];
            checkFloat(name, interest, messages, companyData);
        }
        if (messages.length > 0) {
            setAllPassed(false);
        }
        if (messages.length == 0) {
            setAllPassed(true);
        }
        return messages;

    }

    //checks if a UBO_INT file is formatted correctly
    const checkUBO_INT = (data) => {
        let messages = [];
        const actualLabels = ["Cont Acct", "Name", "Name 2", "House number and street", "City", "Zip Code", "Rg", "LC Amount", "SSN"];
        const headerErrorMessage = "File headers are incorrect or selected file is not a 1099 UBO INT file.";

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var personData = data[i];
            const dataKeys = Object.keys(data[0]);
            console.log(dataKeys);

            //check if headers are correct
            if (!checkHeaders(dataKeys, actualLabels, headerErrorMessage)) {
                break;
            }

            //get the person's name
            let name = personData[dataKeys[1]] + " " + personData[dataKeys[2]];

            //check name, name2, house number and street
            const alphaIdx = [1, 2, 3, 4, 6]
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData);

            //check zip
            const zip = dataKeys[5];
            checkLeqNineDigits(name, zip, messages, personData);

            //check contAcct
            const contAcct = dataKeys[0];
            checkLeqNineDigits(name, contAcct, messages, personData);

            //check SSN
            const ssn = dataKeys[8];
            checkNineDigits(name, ssn, messages, personData);

            //check LC Amount
            const lcAmount = dataKeys[7];
            checkFloat(name, lcAmount, messages, personData);
        }
        return messages;

    }


    //** OTHER FUNCTIONS **//

    //function that executes appropriate check form function based on form type
    const checkForm = (data) => {
        if (formType == "cor_int") {
            return checkCOR_INT(data);
        }
        if (formType == "ubo_int") {
            return checkUBO_INT(data);
        }
        else {
            throw new Error("Have not implemented yet");
        }
    }

    //make sure that the uploaded file is an excel spreadsheet or csv
    //returns true if the file is a spreadsheet, false otherwise
    const isSpreadsheet = (file) => {
        //if there's a file and it's an allowed type, set file = selected
        if (file && types.includes(file.type)) {
            return true;
        }
        //if we have an error
        else {
            return false
        }
    }

    //reads the inputted excel file and checks to see if it's correctly formatted
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
                reject(err)
            }
        });

        //check the format of the items in the excel file
        promise.then((data) => {
            let out = checkForm(data);
            setMessage(out);
        });
    }


    return (
        <Fragment>

            <div className="container mx-auto">
                <div className="row">
                    <div className="card mx-auto w-100 p-3">
                        <div className="card-title mx-auto lead">2. Choose a file: </div>
                        <div className="custom-file">
                            <input type="file" className="custom-file-input" id="customFile" name="filename" onChange={(e) => {
                                clearErrorFunct();
                                try {
                                    const file = e.target.files[0];
                                    setFileName(file.name);

                                    //did a person decide what type of form that they want to check?
                                    if (!formType) {
                                        throw new Error("Please select the type of form you want to check from the dropdown menu.");
                                    }
                                    //is the file an excel spreadsheet?
                                    if (isSpreadsheet(file)) {
                                        readExcel(file);
                                    }
                                    else {
                                        errorMessageFunct("Please choose an Excel or CSV file.")
                                    }
                                }
                                catch (err) {
                                    errorMessageFunct(err.message);
                                }
                            }} />
                            <label className="custom-file-label" htmlFor="customFile">{fileName}</label>
                        </div>
                    </div>
                </div>
                <div className="row my-4 mx-auto">
                    <Message message={message} allPassed={allPassed}></Message>
                </div>
            </div>

        </Fragment>
    )
}

// {message ? message.map(reqs => (
//     <div key={reqs.label}>
//         <div>{reqs.label}</div>
//         <div>{reqs.passes}</div>
//     </div>
// )) :
//     <div>
//         No Errors
// </div>
// }

export default FileUploadAndChecker
