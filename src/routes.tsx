import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

import Home from './pages/Home';
import CreatePoint from './pages/CreatePoint';
import PageNotFound from './pages/PageNotFound';

const Routes = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route component={Home} exact path='/' />
        <Route component={CreatePoint} path='/create-point' />
        <Route component={PageNotFound} path='/404' />
        <Redirect to='/404' />
      </Switch>
    </BrowserRouter>
  )
}

export default Routes;