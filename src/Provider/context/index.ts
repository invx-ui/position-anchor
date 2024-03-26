import { createContext } from 'react';
import { Position, PositionProviderProps } from '../index.js';

export interface PositionContext extends Omit<PositionProviderProps, 'children'> {
  rootClass: string
  id: string
  placement: Position
  popupStyles: {
    left: number | string;
    position: string;
    top: number | string;
  }
  setAnchorRef: React.MutableRefObject<HTMLElement | undefined>
  setPopupRef: React.MutableRefObject<HTMLElement | undefined>
  updatePopupPosition: (currentPosition: Position) => void
  checkCollisions: () => void
}

export const PositionContext = createContext<PositionContext>({} as PositionContext);
