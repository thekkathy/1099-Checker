import React, { Fragment, useState } from 'react';
import XLSX from 'xlsx';

export const FileUploadAndChecker = ({ formType }) => {
    // list of objects that keeps track of which messages for each label
    // [{label: company name, passes: true}, {label: company address, passes: true}, ...]
    // true = formated correctly
    // false = formated incorrectly
    const [message, setMessage] = useState([]);

    const types = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']


    //** HELPER FUNCTIONS  **//

    //if a label is formatted correctly, the message is set to null
    //if a lbel is incorrect, an error message will be added
    const updateMessages = (name, passed, key, formatList, errorMessage) => {
        let req = {};
        let label = name + " " + key;

        if (passed) {
            console.log(key + " correct");
            // below lines for debug
            // req["label"] = label;
            // req["passes"] = "Passes";
            // formatList.push(req);
        }
        else {
            console.log(key + " incorrect");
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



    //** CHECK FORM FUNCTIONS  **//

    //checks if a COR_INT file is formatted correctly
    const checkCOR_INT = (data) => {
        let messages = [];

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var companyData = data[i];
            const dataKeys = Object.keys(data[0]);

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
        return messages;

    }

    //checks if a UBO_INT file is formatted correctly
    const checkUBO_INT = (data) => {
        let messages = [];

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var personData = data[i];
            const dataKeys = Object.keys(data[0]);
            console.log(dataKeys);

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

    //function that executes appropriate check form function based on form type
    const checkForm = (data) => {
        if (formType == "cor_int") {
            return checkCOR_INT(data);
        }
        if (formType == "ubo_int") {
            return checkUBO_INT(data);
        }
        else {
            return "Error in check form"
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

            <input type="file" onChange={(e) => {
                const file = e.target.files[0];
                readExcel(file);
            }} />

            <div className="custom-file mb-3">
                <input type="file" className="custom-file-input" id="customFile" name="filename" />
                <label class="custom-file-label" for="customFile">Choose file</label>
            </div>

            {message ? message.map(reqs => (
                <div key={reqs.label}>
                    <div>{reqs.label}</div>
                    <div>{reqs.passes}</div>
                </div>
            )) :
                <div>
                    No Errors
            </div>
            }

        </Fragment>
    )
}

export default FileUploadAndChecker
