import React, { useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Stage, Container } from '@pixi/react';
import { Application } from 'pixi.js';
import { RootState } from '@app/store';
import { startSpin, completeSpin, showWin, hideWin } from '@entities/game/model/slice';
import { Reel } from '@entities/game/ui/Reel';
import styles from './styles.module.scss';

const REEL_WIDTH = 800;
const REEL_HEIGHT = 1000;
const VERTICAL_OFFSET = 450;

export const GamePage: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    isSpinning, 
    spinResult, 
    showWinPopup, 
    winningSymbolId,
    spinDuration,
    isAnimationComplete 
  } = useSelector((state: RootState) => state.game);
  
  const stageRef = useRef<Application>(null);

  const handleReelComplete = useCallback(() => {
    dispatch(completeSpin());
  }, [dispatch]);

  const handleSpin = useCallback(() => {
    if (!isSpinning && isAnimationComplete) {
      dispatch(startSpin());
    }
  }, [dispatch, isSpinning, isAnimationComplete]);

  const handleWinReveal = useCallback((symbolId: number) => {
    dispatch(showWin(symbolId));
    setTimeout(() => {
      dispatch(hideWin());
    }, 3000);
  }, [dispatch]);

  return (
    <div className={styles.gameContainer}>
      <Stage
        width={REEL_WIDTH}
        height={REEL_HEIGHT}
        options={{ 
          backgroundColor: 0x1099bb,
          resolution: window.devicePixelRatio || 1,
          antialias: true,
          autoDensity: true,
          powerPreference: 'high-performance'
        }}
      >
        <Container x={REEL_WIDTH / 2} y={REEL_HEIGHT / 2 - VERTICAL_OFFSET}>
          <Reel
            index={0}
            isSpinning={isSpinning}
            onComplete={handleReelComplete}
            spinDuration={spinDuration}
            targetSymbolId={spinResult}
            onWinReveal={handleWinReveal}
          />
        </Container>
      </Stage>

      <button 
        className={styles.spinButton}
        onClick={handleSpin}
        disabled={isSpinning || !isAnimationComplete}
      >
        {isSpinning ? 'Вращение...' : 'Крутить'}
      </button>

      {showWinPopup && winningSymbolId !== null && (
        <div className={`${styles.winPopup} ${styles.visible}`}>
          <img 
            src={`symbols/symbo${winningSymbolId + 1}.png`}
            alt={`Symbol ${winningSymbolId + 1}`} 
          />
          <h2>Поздравляем!</h2>
        </div>
      )}
    </div>
  );
}; 