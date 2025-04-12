import React from 'react';
import '../styles/request.css';

const ValidateRequest = ({ onSubmit, isLoading }) => {
    const [key, setKey] = React.useState('');

    const handleGetRequest = () => {
        onSubmit('GET', key);
    };

    const handlePostRequest = () => {
        onSubmit('POST', key);
    };

    return (
        <div className="validate-request-container">
            <div className="validate-form">
                <h1 className="form-title">Validate Request</h1>
                
                <div className="input-group">
                    <label htmlFor="key" className="input-label">13-Digit Key</label>
                    <input
                        type="text"
                        id="key"
                        className="input-field"
                        placeholder="Enter 13-digit key"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        maxLength={13}
                    />
                </div>

                <div className="button-group">
                    <button 
                        className="request-button get-request"
                        onClick={handleGetRequest}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing...
                            </div>
                        ) : (
                            'GET Request'
                        )}
                    </button>
                    <button 
                        className="request-button post-request"
                        onClick={handlePostRequest}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing...
                            </div>
                        ) : (
                            'POST Request'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValidateRequest; 