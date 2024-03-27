import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Anchor, Position, Popup, PositionAnchor } from '@invx-ui/boilerplate'
import Draggable from 'react-draggable';

const PositionExample: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef(position);
  const checkCollisionsRef = useRef<Function>(() => { });

  const onControlledDragStop = (e: any, positionData: any) => {
    const { x, y } = positionData;
    setPosition({ x, y });
    positionRef.current = { x, y };
    if (checkCollisionsRef.current) {
      checkCollisionsRef.current();
    }
  };

  return (
    <Draggable
      position={position}
      onDrag={onControlledDragStop}
    >
      <div>
        <PositionAnchor
          placement='top'
        >
          {
            ({
              checkCollisions,

            }) => {
              checkCollisionsRef.current = checkCollisions;
              return (
                <>
                  <Anchor>
                    <div style={{
                      width: '200px',
                      height: '20px',
                    }}>
                      Click Me
                    </div>
                  </Anchor>
                  <Popup>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: 'white',
                      border: '1px solid black',
                    }}>
                      Hover Me
                    </div>
                  </Popup>
                </>
              )
            }
          }
        </PositionAnchor>
      </div>
    </Draggable>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    }}><PositionExample /></div>
  </React.StrictMode>,
);