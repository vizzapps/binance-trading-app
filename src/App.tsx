import React from 'react';
import { Switch, Route, HashRouter } from 'react-router-dom';
/*import icon from '../assets/icon.svg';*/
import './App.global.css';
import Main from './pages/Main';
import Settings from './pages/Settings';


export default function App() {
  return (
    <div>
      <HashRouter>
        <Switch>
          <Route exact={true} path='/' component={Main} />
          <Route path='/settings' component={Settings} />
        </Switch>
      </HashRouter>
    </div>
  );
}
