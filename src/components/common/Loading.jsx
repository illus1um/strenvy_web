import React, { memo } from 'react';
import './Loading.css';

const Loading = memo(function Loading({ text = 'Loading...' }) {
    return (
        <div className="loading-container">
            <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            <p className="loading-text">{text}</p>
        </div>
    );
});

export default Loading;
