import React from 'react';
import {Box} from "grommet/es6";
import {Route} from "react-router-dom";
import PokerPage from "./pages/PokerPage";
import {StartPage} from "./pages/StartPage";
import {NewSessionPage} from "./pages/NewSessionPage";
import {ImpressumPage} from "./pages/ImpressumPage";

const App = () => (
  <Box>
    <Route path={"/"} exact component={StartPage}/>
    <Route path={"/new"} component={NewSessionPage}/>
    <Route path={"/poker/:sessionId"} component={PokerPage}/>
    <Route path={"/impressum"} component={ImpressumPage}/>
  </Box>
)

export default App;
