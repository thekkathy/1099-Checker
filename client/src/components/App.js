import React, { useState } from 'react';
import FileUploadAndChecker from './FileUploadAndChecker';
import ErrorMessage from './ErrorMessage';

const App = () => {
  // formType = COR INT, UBO INT, DSS Misc, etc
  const [formType, setFormType] = useState(null);
  //error messages is an array of all possible interface errors (e.g. the user forgot to select a form type)
  const [errorMessages, setErrorMessages] = useState([]);
  //clears the messages in the third section if true
  const [clearMessages, setClearMessages] = useState(false);
  //clears the filename in the choose file bar if true
  const [clearFileName, setClearFileName] = useState(false);

  const formNames = {
    'cor_int': '1099 COR INT',
    'ubo_int': '1099 UBO INT',
    'dss_misc': '1099 DSS MISC',
    'finance_misc': '1099 Finance MISC',
    'dss_nec': '1099 DSS NEC',
    'finance_nec': '1099 Finance NEC'
  }

  //sets the error message from FileUploadAndChecker so that it can be used in the ErrorMessage component
  const setError = (msg) => {
    setErrorMessages(errorMessages => [...errorMessages, msg]);
    console.log(errorMessages);
  }

  //clears error messages
  const clearError = () => {
    setErrorMessages([]);
  }

  //clears error messages
  const onClearMessages = (clear) => {
    setClearMessages(clear);
    console.log("on clear messages")
  }

  const onFormSelect = (formType) => {
    setFormType(formType);
    setErrorMessages([]);
    setClearMessages(true);
    setClearFileName(true);
  }

  return (

    <div className="container mt-4">
      <h4 className="display-4 text-center mb-4">
        1099 Checker
      </h4>
      {/* Display error message if one exists */}
      {errorMessages ? <ErrorMessage messages={errorMessages}></ErrorMessage> : null}

      {/* Menu to select which form to check */}
      <div className="container">
        <div className="card w-100">
          <div className="card-title mx-auto my-2 lead">1. Please select a form to check: </div>
          <div className="row my-2 justify-content-center">
            <div class="dropdown">
              <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                Select A Form
          </button>
              <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                <a class="dropdown-item" onClick={() => onFormSelect("cor_int")}>COR INT</a>
                <a class="dropdown-item" onClick={() => onFormSelect("ubo_int")}>UBO INT</a>
                <a class="dropdown-item" onClick={() => onFormSelect("dss_misc")}>DSS MISC</a>
                <a class="dropdown-item" onClick={() => onFormSelect("finance_misc")}>Finance MISC</a>
                <a class="dropdown-item" onClick={() => onFormSelect("dss_nec")}>DSS NEC</a>
                <a class="dropdown-item" onClick={() => onFormSelect("finance_nec")}>Finance NEC</a>
              </div>
            </div>
          </div>
          <div className="row my-2">
            <div className="container d-flex justify-content-center">
              {formType ?
                <div className="alert alert-info" role="alert">
                  Selected {formNames[formType]} for checking
                </div>
                : null}
            </div>
          </div>
        </div>
        <div className="row my-4">
          <FileUploadAndChecker
            formType={formType}
            errorMessageFunct={setError}
            clearErrorFunct={clearError}
            onClearMessages={onClearMessages}
            clearMessages={clearMessages}
            clearFileName={clearFileName} />
        </div>
      </div>
    </div >
  );
}

export default App;
