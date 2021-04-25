import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { hot } from 'react-hot-loader';
import SocketApp from '../containers/App';
import './styles.css';

const App = hot(module)(() => (
  <SocketApp />
));

export default App;
