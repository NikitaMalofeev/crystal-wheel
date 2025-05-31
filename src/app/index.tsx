import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { GamePage } from '@pages/game';
import '@app/styles/index.scss';

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <GamePage />
    </Provider>
  );
}; 