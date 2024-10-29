import React, { HTMLProps, useEffect, useId, useRef, useState } from 'react';
import { PositionContext } from './context/index.js';
import { debounce } from '../utils/debounce/index.js';

export const positionBaseClass = 'position';

export type ChildFunction = (context: PositionContext) => React.ReactNode;

export type PositionPrimary = 'top' | 'right' | 'bottom' | 'left' | 'center';
export type PositionSecondary = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
export type Position = PositionPrimary | PositionSecondary;

export type PositionSettings = {
  classPrefix?: string;
  id?: string;
  placement: Position;
  position?: 'fixed' | 'relative';
};

export type PositionProviderProps = PositionSettings & HTMLProps<HTMLDivElement> & {
  children: React.ReactNode | ChildFunction;
};

export const PositionAnchor: React.FC<PositionProviderProps> = ({
  children,
  classPrefix,
  id: idFromProps,
  placement: placementFromProps,
  position = 'relative',
  ...rest
}) => {
  const [placement, setPlacement] = useState<Position>(placementFromProps);
  const [popupStyles, setPopupStyles] = useState<
    {
      left: number | string;
      position: string;
      top: number | string;
    }
  >({ left: 0, position: 'fixed', top: 0 });
  const anchorRef = useRef<HTMLElement>();
  const popupRef = useRef<HTMLElement>();

  const uniqueId = useId();
  const id = idFromProps || uniqueId;
  const prefixToUse = classPrefix;
  const rootClass = prefixToUse ? `${prefixToUse}__${positionBaseClass}` : `invx-${positionBaseClass}`;


  const updatePopupPosition = (currentPlacement: Position) => {
    if (anchorRef?.current && popupRef?.current) {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      const popupRect = popupRef.current?.getBoundingClientRect();

      if (!anchorRect || !popupRect) return;

      let newStyles = {
        left: 0,
        position: 'absolute',
        top: 0,
      };

      const setPosition = (horizontal: number, vertical: number) => {
        newStyles = {
          left: horizontal,
          position: 'absolute',
          top: vertical,
        };
      };

      const offsetParentRect = anchorRef.current.offsetParent?.getBoundingClientRect();

      if (!offsetParentRect) {
        return;
      }

      const relativeTop = anchorRect.top - offsetParentRect.top;
      const relativeLeft = anchorRect.left - offsetParentRect.left;
      const relativeRight = offsetParentRect.right - anchorRect.right;

      switch (currentPlacement) {
        case 'top':
          setPosition(
            relativeLeft + (anchorRect.width - popupRect.width) / 2,
            relativeTop - popupRect.height,
          );
          break;
        case 'right':
          setPosition(relativeLeft + anchorRect.width, relativeTop + (anchorRect.height - popupRect.height) / 2);
          break;
        case 'bottom':
          setPosition(
            relativeLeft + (anchorRect.width - popupRect.width) / 2,
            relativeTop + anchorRect.height,
          );
          break;
        case 'left':
          setPosition(relativeLeft - popupRect.width, relativeTop + (anchorRect.height - popupRect.height) / 2);
          break;
        case 'center':
          setPosition(
            relativeLeft + (anchorRect.width - popupRect.width) / 2,
            relativeTop + (anchorRect.height - popupRect.height) / 2,
          );
          break;
        case 'bottom-left':
          setPosition(relativeLeft, relativeTop + anchorRect.height);
          break;
        case 'bottom-right':
          setPosition(relativeRight - popupRect.width, relativeTop + anchorRect.height);
          break;
        case 'top-left':
          setPosition(relativeLeft, relativeTop - popupRect.height);
          break;
        case 'top-right':
          setPosition(relativeRight - popupRect.width, relativeTop - popupRect.height);
          break;
        default:
          break;
      }

      setPopupStyles({
        left: `${newStyles.left}px`,
        position: newStyles.position || 'absolute',
        top: `${newStyles.top}px`,
      });
    }
  };

  const checkCollisions = () => {
    if (anchorRef?.current && popupRef?.current) {
      const anchorRect = anchorRef.current?.getBoundingClientRect();
      const popupRect = popupRef.current?.getBoundingClientRect();

      if (!anchorRect || !popupRect) return;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const collidesWithTop = popupRect.top <= 0;
      const collidesWithRight = popupRect.right >= windowWidth;
      const collidesWithBottom = popupRect.bottom >= windowHeight;
      const collidesWithLeft = popupRect.left <= 0;

      if (collidesWithTop) {
        setPlacement('bottom');
      } else if (collidesWithRight) {
        setPlacement('left');
      } else if (collidesWithBottom) {
        setPlacement('top');
      } else if (collidesWithLeft) {
        setPlacement('right');
      }
    }
  };

  const rateLimit = 200;

  const debouncedUpdatePopupPosition = useRef(
    debounce((newPlacement: Position) => updatePopupPosition(newPlacement), rateLimit),
  ).current;

  const debouncedCheckCollisions = useRef(
    debounce(() => checkCollisions(), rateLimit),
  ).current;

  useEffect(() => {
    window.addEventListener('resize', debouncedCheckCollisions);
    return () => {
      window.removeEventListener('resize', debouncedCheckCollisions);
    };
  }, [debouncedCheckCollisions]);

  useEffect(() => {
    debouncedUpdatePopupPosition(placement);
    requestAnimationFrame(() => {
      debouncedCheckCollisions();
    });
    debouncedCheckCollisions();
  }, [debouncedCheckCollisions, debouncedUpdatePopupPosition, placement]);

  const context = {
    checkCollisions,
    id,
    placement,
    popupStyles,
    rootClass,
    setAnchorRef: anchorRef,
    setPopupRef: popupRef,
    updatePopupPosition,
  };

  return (
    <PositionContext.Provider value={context}>
      <div
        style={{
          position,
        }}
        {...rest}
      >
        {typeof children === 'function' ? children(context) : children}
      </div>
    </PositionContext.Provider>
  );
};
