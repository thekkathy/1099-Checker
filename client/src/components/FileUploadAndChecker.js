import React, { Fragment, useState } from 'react';
import XLSX from 'xlsx';
import Message from './Message';

export const FileUploadAndChecker = ({ formType, errorMessageFunct, clearErrorFunct, onClearMessages, onClearFileName, clearMessages, clearFileName }) => {
    // list of objects that keeps track of which messages for each label
    // [{label: company name, passes: true}, {label: company address, passes: true}, ...]
    // true = formated correctly
    // false = formated incorrectly
    const [message, setMessage] = useState(null);
    // variable that keeps track of if everything passed
    const [allPassed, setAllPassed] = useState(true)
    // name of uploaded file
    const [fileName, setFileName] = useState('Choose File');

    const types = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']


    //** HELPER FUNCTIONS  **//

    //if a label is formatted correctly, the message is set to null
    //if a lbel is incorrect, an error message will be added
    const updateMessages = (name, passed, key, formatList, errorMessage, rowNum) => {
        let req = {};
        let label = name + " " + key;

        if (!passed) {
            req["label"] = label + " at row " + rowNum.toString();
            req["passes"] = errorMessage;
            formatList.push(req);
        }

    }

    //return true if there is no value (e.g. valueToCheck == '')
    const checkEmpty = (valueToCheck) => {
        if (valueToCheck === '' || valueToCheck === undefined) {
            return true;
        }
        return false
    }

    //checks if the inputted value contains only numbers and letters and is below the specified length
    //alphaIdx = the index locations of teh keys that you want to check w/ alphanum from dataKeys
    //name = the name of the company or person
    //format = the format object updateMessages updates
    //dataKeys = the labels in the form (e.g. name, zip)
    //indivData = one company/person's information
    //rowNm = the row number being checked
    //length = the max length of the input, -1 if there is no max length
    const checkAlphanum = (alphaIdx, name, format, dataKeys, indivData, rowNum, length) => {
        let emptyVal = false;
        let alphanum = null;
        let errorMessage = "";
        if (length < 0) {
            alphanum = /^[A-Za-z0-9 ]*$/g;
            errorMessage = name + " " + key + " must contain only letters and whole numbers.";
        }
        else {
            const alphanumStr = "^[A-Za-z0-9 ]{1,length}$".replace('length', length);
            alphanum = new RegExp(alphanumStr);
            errorMessage = name + " " + key + ` must contain only letters and whole numbers. The input also cannot be over ${length} characters.`;
        }
        for (var k = 0; k < alphaIdx.length; k++) {
            var key = dataKeys[alphaIdx[k]];
            var valueToCheck = indivData[key].toString();
            if (checkEmpty(valueToCheck) && length > 0) {
                emptyVal = true;
                break;
            }
            let passed = valueToCheck.match(alphanum);
            if (length < 0) {
                passed = "empty";
            }
            updateMessages(name, passed, key, format, errorMessage, rowNum);
        }
        if (emptyVal) {
            errorMessage = "No " + key + " at row " + rowNum.toString();
            updateMessages(name, false, key, format, errorMessage, rowNum);
        }

    }

    //checks if an input contains only digits and doesn't exceed 9 characters
    //name = the name of the company or person
    //label = the label of the input (e.g. name, zip, etc)
    //format = the format object updateMessages updates
    //indivData = one company/person's information
    const checkLeqNineDigits = (name, label, format, indivData, allowDashes = false, rowNum) => {
        const nineDigitCheck = 100000000;
        var valueToCheck = indivData[label];
        let emptyVal = false;
        if (checkEmpty(valueToCheck)) {
            emptyVal = true;
            let errorMessage = "No " + label + " at row " + rowNum.toString();
            updateMessages(name, false, label, format, errorMessage, rowNum);
            return;
        }
        let passed = true;
        if (allowDashes) {
            const allowedCharacters = /[\d-]+/g;
            if (typeof valueToCheck == "number") {
                passed = typeof valueToCheck == "number" && Number.isInteger(valueToCheck) && valueToCheck / nineDigitCheck < 10;
            }
            else {
                passed = valueToCheck.match(allowedCharacters) && parseInt(valueToCheck.replace('-', '')) / nineDigitCheck < 10;
            }
        }
        else {
            passed = typeof valueToCheck == "number" && Number.isInteger(valueToCheck) && valueToCheck / nineDigitCheck < 10;
        }
        let errorMessage = label + " must contain only whole numbers and cannot exceed 9 characters.";
        updateMessages(name, passed, label, format, errorMessage, rowNum);
    }

    //checks if an input contains only digits and is 9 characters
    //name = the name of the company or person
    //label = the label of the input (e.g. name, zip, etc)
    //format = the format object updateMessages updates
    //indivData = one company/person's information
    const checkNineDigits = (name, label, format, indivData, rowNum) => {
        const nineDigitCheck = 100000000;
        var valueToCheck = indivData[label];
        if (checkEmpty(valueToCheck)) {
            let errorMessage = "No " + label + " at row " + rowNum.toString();
            updateMessages(name, false, label, format, errorMessage, rowNum);
            return;
        }
        let passed = typeof valueToCheck == "number" && Number.isInteger(valueToCheck) && valueToCheck / nineDigitCheck < 10 && valueToCheck / nineDigitCheck >= 1;
        let errorMessage = label + " must be 9 digits and must only contain whole numbers.";
        updateMessages(name, passed, label, format, errorMessage, rowNum);
    }

    //checks if an input is a float
    //name = the name of the company or person
    //label = the label of the input (e.g. name, zip, etc)
    //format = the format object updateMessages updates
    //indivData = one company/person's information
    const checkFloat = (name, label, format, indivData, rowNum, removeDashes) => {
        var valueToCheck = indivData[label];
        if (removeDashes) {
            let valStr = valueToCheck.toString();
            valueToCheck = parseInt(valStr.replace('-', ''));
        }
        if (checkEmpty(valueToCheck)) {
            let errorMessage = "No " + label + " at row " + rowNum.toString();
            updateMessages(name, false, label, format, errorMessage, rowNum);
            return;
        }
        let passed = typeof valueToCheck === "number";
        let errorMessage = label + " must be a number (can be a whole number or a decimal)";
        updateMessages(name, passed, label, format, errorMessage, rowNum);
    }

    //checks if an input is contains only alpha characters of the provided length
    //name = the name of the company or person
    //label = the label of the input (e.g. name, zip, etc)
    //format = the format object updateMessages updates
    //indivData = one company/person's information
    const checkLetters = (name, label, format, indivData, rowNum, length) => {
        var valueToCheck = indivData[label];
        if (checkEmpty(valueToCheck) && length > 0) {
            let errorMessage = "No " + label + " at row " + rowNum.toString();
            updateMessages(name, false, label, format, errorMessage, rowNum);
            return;
        }
        let alpha = null;
        let errorMessage = "";
        if (length < 0) {
            alpha = /^[A-Za-z]*$/g;
            errorMessage = label + " must contain only letters";
        }
        else {
            const alphaStr = "^[A-Za-z]{1,length}$".replace('length', length);
            alpha = new RegExp(alphaStr);
            errorMessage = label + ` must contain only letters and be less than ${length} characters`;
        }
        let passed = valueToCheck.match(alpha);
        if (length < 0) {
            passed = ["empty ok"];
        }
        updateMessages(name, passed, label, format, errorMessage, rowNum);
    }

    //check if headers for the form are correct
    //if headers are incorrect, set the error message and return false
    const checkHeaders = (expectedLabels, actualLabels, errMessage) => {
        if (expectedLabels.length != actualLabels.length) {
            errorMessageFunct(errMessage);
            return false;
        }
        for (var i = 0; i < expectedLabels.length; i++) {
            if (!expectedLabels[i].toLowerCase().includes(actualLabels[i].toLowerCase())) {

                console.log("actual labels")
                console.log(actualLabels[i]);
                console.log("expected labels")
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
        const headerErrorMessage = `Selected file is not a 1099 COR INT file or file headers are incorrect. Please make sure that the right file was selected and that the headers match this order and casing: ${actualLabels.join(", ")}`;
        let headerErrorPresent = false;

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var companyData = data[i];
            const dataKeys = Object.keys(data[0]);

            //check if headers are correct
            if (!checkHeaders(dataKeys, actualLabels, headerErrorMessage)) {
                headerErrorPresent = true;
                break;
            }

            //get company name
            let name = companyData[dataKeys[0]];

            //check address, city, state
            const alphaIdx = [0, 1, 2, 3];
            checkAlphanum(alphaIdx, name, messages, dataKeys, companyData, i + 2, 50);

            //check zip
            const zip = dataKeys[4];
            checkLeqNineDigits(name, zip, messages, companyData, true, i + 2);

            //check EIN
            var ein = dataKeys[5];
            checkNineDigits(name, ein, messages, companyData, i + 2);

            //check interest
            var interest = dataKeys[6];
            checkFloat(name, interest, messages, companyData, i + 2);
        }
        checkAllPassed(messages, headerErrorPresent);
        return messages;

    }

    //checks if a UBO_INT file is formatted correctly
    const checkUBO_INT = (data) => {
        let messages = [];
        const actualLabels = ["Cont Acct", "Name", "Name 2", "House number and street", "City", "Zip Code", "Rg", "LC Amount", "SSN"];
        const headerErrorMessage = `Selected file is not a 1099 UBO INT file or file headers are incorrect. Please make sure that the right file was selected and that the headers match this order and casing: ${actualLabels.join(", ")}`;
        let headerErrorPresent = false;

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var personData = data[i];
            const dataKeys = Object.keys(data[0]);
            console.log(dataKeys);

            //check if headers are correct
            if (!checkHeaders(dataKeys, actualLabels, headerErrorMessage)) {
                headerErrorPresent = true;
                break;
            }

            //get the person's name
            let name = personData[dataKeys[1]] + " " + personData[dataKeys[2]];

            //check name, name2, house number and street
            const alphaIdx = [1, 2, 3, 4, 6]
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData, i + 2, 50);

            //check zip
            const zip = dataKeys[5];
            checkLeqNineDigits(name, zip, messages, personData, false, i + 2);

            //check contAcct
            const contAcct = dataKeys[0];
            checkLeqNineDigits(name, contAcct, messages, personData, false, i + 2);

            //check SSN
            const ssn = dataKeys[8];
            checkNineDigits(name, ssn, messages, personData, i + 2);

            //check LC Amount
            const lcAmount = dataKeys[7];
            checkFloat(name, lcAmount, messages, personData, i + 2);
        }
        checkAllPassed(messages, headerErrorPresent);
        return messages;

    }

    //checks if a DSS_MISC file is formatted correctly
    const checkDSS_MISC = (data) => {
        console.log(data)
        let messages = [];
        const actualLabels = ["Withholding Code", "SSN", "Name", "Address", "City", "State", "Zip", "Compensation", "Comments", "System"];
        const headerErrorMessage = `Selected file is not a 1099 MISC DSS file or file headers are incorrect. Please make sure that the right file was selected and that the headers match this order and casing: ${actualLabels.join(", ")}`;
        let headerErrorPresent = false;

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var personData = data[i];
            const dataKeys = Object.keys(data[0]);

            //check if headers are correct
            if (!checkHeaders(dataKeys, actualLabels, headerErrorMessage)) {
                headerErrorPresent = true;
                break;
            }

            //get the person's name
            let name = personData[dataKeys[2]];

            //check witholding code and state
            let alphaIdx = [0];
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData, i + 2, 100);

            const state = dataKeys[5];
            checkLetters(name, state, messages, personData, i + 2, 2);

            //check name, address, city
            alphaIdx = [2, 3, 4];
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData, i + 2, 100);

            //check zip
            const zip = dataKeys[6];
            checkLeqNineDigits(name, zip, messages, personData, true, i + 2);

            //check compensation
            const compensation = dataKeys[7];
            checkFloat(name, compensation, messages, personData, false, i + 2);

            //check SSN
            const ssn = dataKeys[1];
            checkNineDigits(name, ssn, messages, personData, i + 2);

            //check comments and system
            alphaIdx = [8, 9];
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData, i + 2, -1);
        }
        checkAllPassed(messages, headerErrorPresent);
        return messages;

    }

    //checks if a Finance_MISC file is formatted correctly
    const checkFinance_MISC = (data) => {
        console.log(data)
        let messages = [];
        const actualLabels = ["Amount", "Fiscal Ven", "Fiscal Tax", "Tax ID", "Fiscal Nam", "Fiscal Str", "City", "State", "Fiscal Zip"];
        const headerErrorMessage = `Selected file is not a 1099 MISC Finance file or file headers are incorrect. Please make sure that the right file was selected and that the headers match this order and casing: ${actualLabels.join(", ")}`;
        let headerErrorPresent = false;

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var personData = data[i];
            const dataKeys = Object.keys(data[0]);
            console.log(dataKeys)

            //check if headers are correct
            if (!checkHeaders(dataKeys, actualLabels, headerErrorMessage)) {
                headerErrorPresent = true;
                break;
            }

            //get the person's name
            let name = personData[dataKeys[4]];

            //check tax ID
            const len = 12;
            let taxID = dataKeys[3];
            let taxIDVal = personData[taxID];
            console.log(taxID);
            console.log(taxIDVal);
            console.log(taxIDVal.length)
            if (taxIDVal.length > len) {
                let errorMessage = taxID + ` must contain only letters and be less than ${len} characters`;
                updateMessages(name, false, taxID, messages, errorMessage, i + 2);
            }
            else {
                checkLeqNineDigits(name, taxID, messages, personData, true, i + 2);
            }

            //check fiscal nam, fiscal str, city, state, fiscal zip
            let alphaIdx = [4, 5, 6, 7, 8];
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData, i + 2, 100);

            //check fiscal ven
            const fiscal_ven = dataKeys[1];
            let fiscalVenIdx = [1];
            checkAlphanum(fiscalVenIdx, name, messages, dataKeys, personData, i + 2, 7);
            checkFloat(name, fiscal_ven, messages, personData, i + 2, true);

            //check fiscal tax
            const fiscal_tax = dataKeys[2];
            let fiscalTaxIdx = [2];
            checkAlphanum(fiscalTaxIdx, name, messages, dataKeys, personData, i + 2, 2);
            checkFloat(name, fiscal_tax, messages, personData, i + 2, true);

            //check amount
            const amount = dataKeys[0];
            checkFloat(name, amount, messages, personData, i + 2, false);

        }

        checkAllPassed(messages, headerErrorPresent);
        return messages;

    }

    //checks if a DSS_NEC file is formatted correctly
    const checkDSS_NEC = (data) => {
        console.log(data)
        let messages = [];
        const actualLabels = ["Withholding Code", "TIN/SSN", "Name", "Address", "City", "State", "Zip Code", "Amount"];
        const headerErrorMessage = `Selected file is not a 1099 NEC DSS file or file headers are incorrect. Please make sure that the right file was selected and that the headers match this order and casing: ${actualLabels.join(", ")}`;
        let headerErrorPresent = false;

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var personData = data[i];
            const dataKeys = Object.keys(data[0]);
            console.log(dataKeys);

            //check if headers are correct
            if (!checkHeaders(dataKeys, actualLabels, headerErrorMessage)) {
                headerErrorPresent = true;
                break;
            }

            //get the person's name
            let name = personData[dataKeys[2]];

            //check witholding code
            let alphaIdx = [0];
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData, i + 2, 100);

            //check SSN
            const ssn = dataKeys[1];
            checkNineDigits(name, ssn, messages, personData, i + 2);

            //check name, address, city, state
            alphaIdx = [2, 3, 4, 5];
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData, i + 2, 100);

            //check zip
            const zip = dataKeys[6];
            checkLeqNineDigits(name, zip, messages, personData, true, i + 2);

            //check amount
            alphaIdx = [7];
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData, i + 2, -1);
        }

        checkAllPassed(messages, headerErrorPresent);
        return messages;

    }

    //checks if a Finance_NEC file is formatted correctly
    const checkFinance_NEC = (data) => {
        console.log(data)
        let messages = [];
        const actualLabels = ["Amount", "Fiscal Ven", "Fiscal Tax", "Tax ID", "Fiscal Nam", "Fiscal Str", "City", "State", "Fiscal Zip"];
        const headerErrorMessage = `Selected file is not a 1099 NEC Finance file or file headers are incorrect. Please make sure that the right file was selected and that the headers match this order and casing: ${actualLabels.join(", ")}`;
        let headerErrorPresent = false;

        //for every item in the sheet
        for (var i = 0; i < data.length; i++) {
            var personData = data[i];
            const dataKeys = Object.keys(data[0]);
            console.log(dataKeys)

            //check if headers are correct
            if (!checkHeaders(dataKeys, actualLabels, headerErrorMessage)) {
                headerErrorPresent = true;
                break;
            }

            //get the person's name
            let name = personData[dataKeys[4]];

            //check tax ID
            const len = 12;
            let taxID = dataKeys[3];
            let taxIDVal = personData[taxID];
            console.log(taxID);
            console.log(taxIDVal);
            console.log(taxIDVal.length)
            if (taxIDVal.length > len) {
                let errorMessage = taxID + ` must contain only letters and be less than ${len} characters`;
                updateMessages(name, false, taxID, messages, errorMessage, i + 2);
            }
            else {
                checkLeqNineDigits(name, taxID, messages, personData, true, i + 2);
            }

            //check fiscal nam, fiscal str, city, state, fiscal zip
            let alphaIdx = [4, 5, 6, 7, 8];
            checkAlphanum(alphaIdx, name, messages, dataKeys, personData, i + 2, 100);

            //check fiscal ven
            const fiscal_ven = dataKeys[1];
            let fiscalVenIdx = [1];
            checkAlphanum(fiscalVenIdx, name, messages, dataKeys, personData, i + 2, 7);
            checkFloat(name, fiscal_ven, messages, personData, i + 2, true);

            //check fiscal tax
            const fiscal_tax = dataKeys[2];
            let fiscalTaxIdx = [2];
            checkAlphanum(fiscalTaxIdx, name, messages, dataKeys, personData, i + 2, 2);
            checkFloat(name, fiscal_tax, messages, personData, i + 2, true);

            //check amount
            const amount = dataKeys[0];
            checkFloat(name, amount, messages, personData, i + 2, false);

        }
        checkAllPassed(messages, headerErrorPresent);
        return messages;

    }


    //** OTHER FUNCTIONS **//

    //sets allPassed to true if there is nothing in messages (the list of errors in the excel file), fase otherwise
    const checkAllPassed = (messages, headerErrorPresent) => {
        if (headerErrorPresent) {
            setAllPassed(false);
        }
        else if (messages.length == 0) {
            setAllPassed(true);
        }
        else {
            setAllPassed(false);
        }
    }

    //function that executes appropriate check form function based on form type
    const checkForm = (data) => {
        if (formType == "cor_int") {
            return checkCOR_INT(data);
        }
        if (formType == "ubo_int") {
            return checkUBO_INT(data);
        }
        if (formType == "dss_misc") {
            return checkDSS_MISC(data);
        }
        if (formType == "finance_misc") {
            return checkFinance_MISC(data);
        }
        if (formType == "dss_nec") {
            return checkDSS_NEC(data);
        }
        if (formType == "finance_nec") {
            return checkFinance_NEC(data);
        }
        else {
            throw new Error("Not a option");
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
                const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                resolve(data);
            };

            fileReader.onerror = (err) => {
                reject(err)
            }
        });

        //check the format of the items in the excel file
        promise.then((data) => {
            console.log(data)
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
                                onClearMessages(false);
                                try {
                                    const file = e.target.files[0];
                                    onClearFileName(false);
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
                            {clearFileName ? <label className="custom-file-label" htmlFor="customFile">Choose File</label> : <label className="custom-file-label" htmlFor="customFile">{fileName}</label>}
                        </div>
                    </div>
                </div>
                <div className="row my-4 mx-auto">
                    {clearMessages ? <Message message={null} allPassed={true}></Message> : <Message message={message} allPassed={allPassed}></Message>}
                </div>
            </div>

        </Fragment>
    )
}

export default FileUploadAndChecker
