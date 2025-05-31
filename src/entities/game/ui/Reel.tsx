import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { Container, Sprite, Graphics } from '@pixi/react';
import { Texture, SCALE_MODES, Graphics as PixiGraphics } from 'pixi.js';
import { gsap } from 'gsap';
import { useSelector } from 'react-redux';
import { RootState } from '@app/store';
import { SYMBOL_URLS } from '@entities/game/model/slice';

interface ReelProps {
  index: number;
  isSpinning: boolean;
  onComplete: () => void;
  spinDuration: number;
  targetSymbolId: number | null;
  onWinReveal: (symbolId: number) => void;
}

const REEL_RADIUS = 150;
const SYMBOL_SIZE = 70;
const SYMBOLS_COUNT = SYMBOL_URLS.length;
const ANGLE_PER_SYMBOL = (2 * Math.PI) / SYMBOLS_COUNT;
const ROTATION_MULTIPLIER = 8;
const OVERSHOOT_ANGLE = Math.PI / 3;
const INITIAL_OFFSET = -Math.PI / 2;
const SYMBOL_OFFSET_FACTOR = 0.95;

const Indicator = memo<{ isSpinning: boolean }>(({ isSpinning }) => {
  const arrowRef = useRef<any>(null);
  const arrowTipRef = useRef<any>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (isSpinning && arrowRef.current && arrowTipRef.current) {
      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.timeline()
        .to(arrowTipRef.current, {
          rotation: -0.6,
          duration: 0.5,
          ease: "power2.out"
        });
    } else if (arrowRef.current && arrowTipRef.current) {
      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.timeline()
        .to(arrowTipRef.current, {
          rotation: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)"
        });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [isSpinning]);

  return (
    <Container ref={arrowRef} y={-REEL_RADIUS - 65}>
      <Container ref={arrowTipRef}>
        <Graphics
          draw={useCallback((g: PixiGraphics) => {
            g.clear();
            
            // Тень
            g.beginFill(0x000000, 0.2);
            g.moveTo(-18, 2);
            g.lineTo(18, 2);
            g.lineTo(0, 42);
            g.lineTo(-18, 2);
            g.endFill();

            // Основная часть стрелки
            g.lineStyle(3, 0x2c3e50);
            g.beginFill(0xe74c3c);
            g.moveTo(-15, 0);
            g.lineTo(15, 0);
            g.lineTo(0, 40);
            g.lineTo(-15, 0);
            g.endFill();

            // Блик
            g.beginFill(0xff6b6b, 0.5);
            g.moveTo(-8, 5);
            g.lineTo(8, 5);
            g.lineTo(0, 25);
            g.lineTo(-8, 5);
            g.endFill();
          }, [])}
        />
      </Container>
    </Container>
  );
});

const StaticWheelDecoration = memo(() => {
  return (
    <Graphics
      draw={useCallback((g: PixiGraphics) => {
        g.clear();
        
        g.beginFill(0x000000, 0.2);
        g.drawCircle(2, 2, REEL_RADIUS + 35);
        g.endFill();

        g.beginFill(0xFFFFFF, 1);
        g.lineStyle(0);
        g.drawCircle(0, 0, REEL_RADIUS + 35);
        g.endFill();

        g.lineStyle(10, 0x2c3e50, 1);
        g.drawCircle(0, 0, REEL_RADIUS + 30);
        
        g.lineStyle(5, 0x34495e, 0.6);
        g.drawCircle(0, 0, REEL_RADIUS + 20);
      }, [])}
    />
  );
});

const RotatingWheelDecoration = memo(() => {
  return (
    <Graphics
      draw={useCallback((g: PixiGraphics) => {
        g.clear();
        
        for (let i = 0; i < SYMBOLS_COUNT; i++) {
          const angle = i * ANGLE_PER_SYMBOL;
          
          g.lineStyle(2, 0x34495e, 0.4);
          g.beginFill(0xf8f9fa, 0.5);
          
          const cellRadius = REEL_RADIUS - 10;
          const startAngle = angle - ANGLE_PER_SYMBOL / 2 + 0.05;
          const endAngle = angle + ANGLE_PER_SYMBOL / 2 - 0.05;
          
          g.moveTo(0, 0);
          g.arc(0, 0, cellRadius, startAngle, endAngle);
          g.lineTo(0, 0);
          g.endFill();

          const x2 = Math.cos(angle) * (REEL_RADIUS + 25);
          const y2 = Math.sin(angle) * (REEL_RADIUS + 25);
          
          g.beginFill(0xe74c3c);
          g.drawCircle(x2, y2, 3);
          g.endFill();

          g.beginFill(0xff6b6b);
          g.drawCircle(x2 - 1, y2 - 1, 1);
          g.endFill();
        }
        
        g.lineStyle(2, 0x34495e, 0.3);
        g.drawCircle(0, 0, REEL_RADIUS - 20);

        g.beginFill(0x2c3e50);
        g.drawCircle(0, 0, 8);
        g.endFill();
        g.beginFill(0x3498db);
        g.drawCircle(0, 0, 5);
        g.endFill();
        
        g.lineStyle(15, 0xFFFFFF, 0.1);
        g.arc(0, 0, REEL_RADIUS + 10, -Math.PI / 4, Math.PI / 4);
      }, [])}
    />
  );
});

export const Reel = memo<ReelProps>(({ 
  isSpinning, 
  onComplete, 
  spinDuration,
  targetSymbolId,
  onWinReveal
}) => {
  const containerRef = useRef<any>(null);
  const [textures, setTextures] = useState<Texture[]>([]);
  const [currentRotation, setCurrentRotation] = useState(INITIAL_OFFSET);
  const [error, setError] = useState<string | null>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const [isArrowSpinning, setIsArrowSpinning] = useState(false);

  useEffect(() => {
    const loadTextures = async () => {
      try {
        console.log('Loading textures from URLs:', SYMBOL_URLS);
        const loadedTextures = await Promise.all(
          SYMBOL_URLS.map(url => {
            const texture = Texture.from(url);
            texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;
            return texture;
          })
        );
        console.log('Textures loaded successfully:', loadedTextures.length);
        setTextures(loadedTextures);
      } catch (err) {
        console.error('Error loading textures:', err);
        setError('Failed to load textures');
      }
    };

    loadTextures();
  }, []);

  useEffect(() => {
    if (isSpinning && containerRef.current && targetSymbolId !== null) {
      console.log('Starting spin animation with targetSymbolId:', targetSymbolId);
      
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }

      setIsArrowSpinning(true);

      const targetRotation = INITIAL_OFFSET - (targetSymbolId * ANGLE_PER_SYMBOL);
      const fullRotations = ROTATION_MULTIPLIER * 2 * Math.PI;
      const totalRotation = fullRotations + targetRotation;
      
      console.log('Animation parameters:', {
        targetRotation,
        fullRotations,
        totalRotation,
        ANGLE_PER_SYMBOL,
        SYMBOLS_COUNT
      });

      animationRef.current = gsap.timeline({
        onComplete: () => {
          setCurrentRotation(targetRotation);
          spinTimeoutRef.current = setTimeout(() => {
            console.log('Animation complete, revealing symbol:', targetSymbolId);
            onComplete();
            onWinReveal(targetSymbolId);
          }, 100);
        }
      });

      animationRef.current
        .to(containerRef.current, {
          rotation: totalRotation + OVERSHOOT_ANGLE,
          duration: spinDuration * 0.8,
          ease: "power2.out"
        })
        .to(containerRef.current, {
          rotation: totalRotation,
          duration: spinDuration * 0.2,
          ease: "elastic.out(1, 0.5)",
          onStart: () => {
            setIsArrowSpinning(false);
          }
        });
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    };
  }, [isSpinning, spinDuration, targetSymbolId, onComplete, onWinReveal]);

  if (error) {
    console.error('Reel error:', error);
    return null;
  }

  return (
    <Container y={400}>
      <StaticWheelDecoration />
      <Container ref={containerRef} rotation={currentRotation}>
        <RotatingWheelDecoration />
        {textures.map((texture, i) => {
          const angle = i * ANGLE_PER_SYMBOL;
          const x = Math.cos(angle) * (REEL_RADIUS * SYMBOL_OFFSET_FACTOR);
          const y = Math.sin(angle) * (REEL_RADIUS * SYMBOL_OFFSET_FACTOR);
          
          return (
            <Sprite
              key={i}
              texture={texture}
              x={x}
              y={y}
              anchor={0.5}
              rotation={-angle}
              width={SYMBOL_SIZE}
              height={SYMBOL_SIZE}
            />
          );
        })}
      </Container>
      <Indicator isSpinning={isArrowSpinning} />
    </Container>
  );
});

StaticWheelDecoration.displayName = 'StaticWheelDecoration';
RotatingWheelDecoration.displayName = 'RotatingWheelDecoration';
Indicator.displayName = 'Indicator';
Reel.displayName = 'Reel'; 