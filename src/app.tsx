import React from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { GameProvider } from '@/context/GameContext';
import './app.scss';

function App(props) {
  useDidShow(() => {});
  useDidHide(() => {});

  return (
    <GameProvider>
      {props.children}
    </GameProvider>
  );
}

export default App;
