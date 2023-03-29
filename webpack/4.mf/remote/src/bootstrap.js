import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
createRoot(document.getElementById('root')).render(<App/>);
//在React17之前 <App/>会被 babel编译成React.createElement
//在之后不需要，在babel编译的时候会自动帮你引入一个jsx方法，实现跟React.createElement相同的功能