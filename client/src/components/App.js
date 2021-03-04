import React, { useState } from 'react';
import FileUploadAndChecker from './FileUploadAndChecker';

const App = () => {
  const [formType, setFormType] = useState(null)

  const formNames = {
    'cor_int': '1099 COR INT',
    'ubo_int': '1099 UBO INT',
    'dss_misc': '1099 DSS MISC',
    'finance_misc': '1099 Finance MISC',
    'dss_nec': '1099 DSS NEC',
    'finance_nec': '1099 Finance NEC'
  }

  return (

    <div className="container mt-4">
      <h4 className="display-4 text-center mb-4">
        1099 Checker
      </h4>

      {/* Menu to select which form to check */}
      <div className="container">
        <div className="container">
          <div className="row my-2">
            <div className="btn-group mx-auto" role="group" aria-label="Choose Form Type">
              {/* Select INT type form */}
              <div className="btn-group" role="group">
                <button id="INT" type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  INT
              </button>
                <div className="dropdown-menu" aria-labelledby="INT">
                  <button className="dropdown-item" onClick={() => setFormType("cor_int")}>COR</button>
                  <button className="dropdown-item" onClick={() => setFormType("ubo_int")}>UBO</button>
                </div>
              </div>
              {/* Select MISC type form */}
              <div className="btn-group" rolw="group">
                <button id="MISC" type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  MISC
                </button>
                <div className="dropdown-menu" aria-labelledby="MISC">
                  <button className="dropdown-item" onClick={() => setFormType("dss_misc")}>DSS</button>
                  <button className="dropdown-item" onClick={() => setFormType("finance_misc")}>Finance</button>
                </div>
              </div>
              {/* Select NEC type form */}
              <div className="btn-group" rolw="group">
                <button id="NEC" type="button" className="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  NEC
              </button>
                <div className="dropdown-menu" aria-labelledby="NEC">
                  <button className="dropdown-item" onClick={() => setFormType("dss_nec")}>DSS</button>
                  <button className="dropdown-item" onClick={() => setFormType("finance_nec")}>Finance</button>
                </div>
              </div>
            </div>
          </div>
          <div className="row my-2">
            <div className="container d-flex justify-content-center">
              {formType ? `Selected ${formNames[formType]} for checking` : null}
            </div>
        </div>
        </div>
        <div className="row my-4">
          <FileUploadAndChecker formType={formType} />
        </div>
      </div>
    </div >
  );
}

export default App;
