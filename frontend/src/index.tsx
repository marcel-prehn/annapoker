import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter} from 'react-router-dom'
import './style.css';
import App from './App';
import {Grommet} from "grommet/es6";
import {annapokerTheme} from "./models/theme";

ReactDOM.render(
  <BrowserRouter>
    <Grommet theme={annapokerTheme}>
      <App/>
    </Grommet>
  </BrowserRouter>,
  document.getElementById('root')
);
