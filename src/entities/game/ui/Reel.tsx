import React, { useRef, useEffect, useState } from 'react';
import { Container, Sprite, Graphics } from '@pixi/react';
import { Texture } from 'pixi.js';
import { gsap } from 'gsap';

interface ReelProps {
  index: number;
  isSpinning: boolean;
  onComplete: () => void;
  spinDuration: number;
  targetSymbolId: number | null;
  onWinReveal: (symbolId: number) => void;
}

const SYMBOL_URLS = [
  'symbols/symbo1.png.jpg',
  'symbols/symbo2.png.png',
  'symbols/symbo3.png.png',
  'symbols/symbo4.png.png',
  'symbols/symbo5.png',
  'symbols/symbo6.png',
  'symbols/symbo7.png',
  'symbols/symbo8.png',
];

const REEL_RADIUS = 150;
const SYMBOL_SIZE = 70;
const SYMBOLS_COUNT = 8;
const ANGLE_PER_SYMBOL = (2 * Math.PI) / SYMBOLS_COUNT;
const ROTATION_MULTIPLIER = 8;
const OVERSHOOT_ANGLE = Math.PI / 3;
const INITIAL_OFFSET = -Math.PI / 2;

const Indicator: React.FC<{ isSpinning: boolean }> = ({ isSpinning }) => {
  const arrowRef = useRef<any>(null);

  useEffect(() => {
    if (isSpinning && arrowRef.current) {
      gsap.to(arrowRef.current, {
        rotation: -0.3,
        duration: 0.3,
        ease: "power1.out"
      });

      gsap.to(arrowRef.current, {
        rotation: -0.1,
        duration: 0.2,
        ease: "elastic.out(1, 0.3)",
        delay: 0.3,
        repeat: -1,
        yoyo: true
      });
    } else if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        rotation: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      });
    }
  }, [isSpinning]);

  return (
    <Container ref={arrowRef}>
      <Graphics
        draw={g => {
          g.clear();
          
          // Внешняя тень
          g.beginFill(0x000000, 0.3);
          g.moveTo(-20, 5);
          g.lineTo(20, 5);
          g.lineTo(0, 35);
          g.lineTo(-20, 5);
          g.endFill();

          // Основная стрелка
          g.beginFill(0xff0000);
          g.moveTo(-15, 0);
          g.lineTo(15, 0);
          g.lineTo(0, 30);
          g.lineTo(-15, 0);
          g.endFill();

          // Блик
          g.beginFill(0xff5555);
          g.moveTo(-8, 4);
          g.lineTo(8, 4);
          g.lineTo(0, 15);
          g.lineTo(-8, 4);
          g.endFill();

          // Обводка
          g.lineStyle(2, 0x000000, 1);
          g.moveTo(-15, 0);
          g.lineTo(15, 0);
          g.lineTo(0, 30);
          g.lineTo(-15, 0);
        }}
        x={0}
        y={-REEL_RADIUS - 25}
      />
    </Container>
  );
};

const WheelDecoration: React.FC = () => (
  <Graphics
    draw={g => {
      g.clear();
      
      // Внешняя тень
      g.beginFill(0x000000, 0.2);
      g.drawCircle(2, 2, REEL_RADIUS + 35);
      g.endFill();

      // Основной фон колеса
      g.beginFill(0xFFFFFF, 1);
      g.lineStyle(0);
      g.drawCircle(0, 0, REEL_RADIUS + 35);
      g.endFill();

      // Внешняя рамка
      g.lineStyle(10, 0x2c3e50, 1);
      g.drawCircle(0, 0, REEL_RADIUS + 30);
      
      // Внутренняя рамка
      g.lineStyle(5, 0x34495e, 0.6);
      g.drawCircle(0, 0, REEL_RADIUS + 20);
      
      // Ячейки и декоративные элементы
      for (let i = 0; i < SYMBOLS_COUNT; i++) {
        const angle = i * ANGLE_PER_SYMBOL;
        
        // Рисуем ячейки
        g.lineStyle(2, 0x34495e, 0.4);
        g.beginFill(0xf8f9fa, 0.5);
        
        const cellRadius = REEL_RADIUS - 10;
        const startAngle = angle - ANGLE_PER_SYMBOL / 2 + 0.05;
        const endAngle = angle + ANGLE_PER_SYMBOL / 2 - 0.05;
        
        g.moveTo(0, 0);
        g.arc(0, 0, cellRadius, startAngle, endAngle);
        g.lineTo(0, 0);
        g.endFill();

        // Декоративные элементы на внешнем круге
        const x2 = Math.cos(angle) * (REEL_RADIUS + 25);
        const y2 = Math.sin(angle) * (REEL_RADIUS + 25);
        
        // Декоративные точки
        g.beginFill(0xe74c3c);
        g.drawCircle(x2, y2, 3);
        g.endFill();

        // Блики на точках
        g.beginFill(0xff6b6b);
        g.drawCircle(x2 - 1, y2 - 1, 1);
        g.endFill();
      }
      
      // Внутренний круг
      g.lineStyle(2, 0x34495e, 0.3);
      g.drawCircle(0, 0, REEL_RADIUS - 20);

      // Центральная точка
      g.beginFill(0x2c3e50);
      g.drawCircle(0, 0, 8);
      g.endFill();
      g.beginFill(0x3498db);
      g.drawCircle(0, 0, 5);
      g.endFill();
      
      // Добавляем блики
      g.lineStyle(15, 0xFFFFFF, 0.1);
      g.arc(0, 0, REEL_RADIUS + 10, -Math.PI / 4, Math.PI / 4);
    }}
  />
);

export const Reel: React.FC<ReelProps> = ({ 
  index, 
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

  useEffect(() => {
    const loadTextures = async () => {
      try {
        const loadedTextures = await Promise.all(
          SYMBOL_URLS.map(url => Texture.from(url))
        );
        setTextures(loadedTextures);
      } catch (err) {
        setError('Failed to load textures');
        console.error('Error loading textures:', err);
      }
    };

    loadTextures();
  }, []);

  useEffect(() => {
    if (isSpinning && containerRef.current && targetSymbolId !== null) {
      const targetRotation = INITIAL_OFFSET - (targetSymbolId * ANGLE_PER_SYMBOL);
      const fullRotations = ROTATION_MULTIPLIER * 2 * Math.PI;
      const totalRotation = fullRotations + targetRotation;
      
      const timeline = gsap.timeline({
        onComplete: () => {
          setCurrentRotation(targetRotation);
          onComplete();
          onWinReveal(targetSymbolId);
        }
      });

      timeline.to(containerRef.current, {
        rotation: totalRotation + OVERSHOOT_ANGLE,
        duration: spinDuration * 0.8,
        ease: "power2.out"
      });

      timeline.to(containerRef.current, {
        rotation: totalRotation,
        duration: spinDuration * 0.2,
        ease: "elastic.out(1, 0.5)"
      });
    }
  }, [isSpinning, spinDuration, targetSymbolId, onComplete, onWinReveal]);

  if (error) {
    return null;
  }

  return (
    <Container x={index * (REEL_RADIUS * 2 + 100)} y={REEL_RADIUS + 100}>
      <WheelDecoration />
      <Indicator isSpinning={isSpinning} />
      <Container ref={containerRef} rotation={currentRotation}>
        {textures.map((texture, i) => {
          const angle = i * ANGLE_PER_SYMBOL;
          const x = Math.cos(angle) * REEL_RADIUS;
          const y = Math.sin(angle) * REEL_RADIUS;
          
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
    </Container>
  );
}; 