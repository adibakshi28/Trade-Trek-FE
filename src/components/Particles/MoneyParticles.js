import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

const MoneyParticles = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesOptions = {
    background: {
      color: {
        value: 'transparent',
      },
    },
    particles: {
      number: {
        value: 50,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      shape: {
        type: ['text'], // Currency symbols
        options: {
          text: {
            value: ['$', '€', '£', '¥', '₿'], // Different currency symbols
            font: '8px Arial',
          }
        }
      },
      color: {
        value: ['#0fdc70', '#ff4444'],
      },
      opacity: {
        value: 0.7,
        random: true,
      },
      size: {
        value: { min: 7, max: 12 }, // Different denomination sizes
        random: true,
      },
      move: {
        enable: true,
        speed: { min: 1, max: 2 }, // Simulate money circulation speed
        direction: 'none',
        random: true,
        straight: false,
        outModes: 'out',
        attract: {
          enable: true,
          rotateX: 2000, // Creates swirling money vortex effect
          rotateY: 2000
        }
      },
      links: {
        enable: true,
        distance: 150,
        color: '#4a00e0',
        opacity: 0.3,
        width: 1,
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'repulse',
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
        push: {
          quantity: 4,
        },
      },
    },
    detectRetina: true,
  };

  return (
    <Particles
      id="money-particles"
      init={particlesInit}
      options={particlesOptions}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
};

export default React.memo(MoneyParticles);