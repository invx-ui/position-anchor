import React, { HTMLProps, useId, useRef, useState, useEffect } from 'react';
import { PositionContext } from './context/index.js';

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
  containerElementId?: string;
  setPopupStyles?: React.Dispatch<
    React.SetStateAction<{
      left?: number | string;
      position: string;
      top?: number | string;
    }>
  >
};

export type PositionProviderProps = PositionSettings & HTMLProps<HTMLDivElement> & {
  children: React.ReactNode | ChildFunction;
};

export const PositionAnchor: React.FC<PositionProviderProps> = ({
  children,
  classPrefix,
  id: idFromProps,
  placement,
  position = 'relative',
  setPopupStyles: setPopupStylesFromProps,
  ...rest
}) => {
  const [popupStyles, setPopupStyles] = useState<
    {
      left?: number | string;
      position: string;
      top?: number | string;
    }
  >({ position: 'absolute' });

  const anchorRef = useRef<HTMLElement>();
  const popupRef = useRef<HTMLElement>();

  const uniqueId = useId();
  const id = idFromProps || uniqueId;
  const prefixToUse = classPrefix;
  const rootClass = prefixToUse ? `${prefixToUse}__${positionBaseClass}` : `invx-${positionBaseClass}`;

  const updatePopupPosition = (currentPlacement: Position) => {
    if (!anchorRef.current || !popupRef.current) return;

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
    const relativeRight = relativeLeft + anchorRect.width;

    const adjustHorizontalPosition = (horizontal: number) => {
      if (horizontal + popupRect.width > window.innerWidth) {
        return window.innerWidth - popupRect.width;
      }
      return horizontal;
    };

    const adjustVerticalPosition = (vertical: number) => {
      if (vertical + popupRect.height > window.innerHeight) {
        return window.innerHeight - popupRect.height;
      }
      return vertical;
    };

    switch (currentPlacement) {
      case 'top':
        setPosition(
          adjustHorizontalPosition(relativeLeft + (anchorRect.width - popupRect.width) / 2),
          adjustVerticalPosition(relativeTop - popupRect.height),
        );
        break;
      case 'right':
        setPosition(
          adjustHorizontalPosition(relativeLeft + anchorRect.width),
          adjustVerticalPosition(relativeTop + (anchorRect.height - popupRect.height) / 2),
        );
        break;
      case 'bottom':
        setPosition(
          adjustHorizontalPosition(relativeLeft + (anchorRect.width - popupRect.width) / 2),
          adjustVerticalPosition(relativeTop + anchorRect.height),
        );
        break;
      case 'left':
        setPosition(
          adjustHorizontalPosition(relativeLeft - popupRect.width),
          adjustVerticalPosition(relativeTop + (anchorRect.height - popupRect.height) / 2),
        );
        break;
      case 'center':
        setPosition(
          adjustHorizontalPosition(relativeLeft + (anchorRect.width - popupRect.width) / 2),
          adjustVerticalPosition(relativeTop + (anchorRect.height - popupRect.height) / 2),
        );
        break;
      case 'bottom-left':
        setPosition(
          adjustHorizontalPosition(relativeLeft - popupRect.width),
          adjustVerticalPosition(relativeTop + anchorRect.height),
        );
        break;
      case 'bottom-right':
        setPosition(
          adjustHorizontalPosition(relativeRight),
          adjustVerticalPosition(relativeTop + anchorRect.height),
        );
        break;
      case 'top-left':
        setPosition(
          adjustHorizontalPosition(relativeLeft - popupRect.width),
          adjustVerticalPosition(relativeTop - popupRect.height),
        );
        break;
      case 'top-right':
        setPosition(
          adjustHorizontalPosition(relativeRight),
          adjustVerticalPosition(relativeTop - popupRect.height),
        );
        break;
      default:
        break;
    }

    setPopupStyles({
      left: `${newStyles.left}px`,
      position: newStyles.position || 'absolute',
      top: `${newStyles.top}px`,
    });

    const updatedPopupRect = popupRef.current.getBoundingClientRect();
    const updatedPosition = {
      x: updatedPopupRect.left + newStyles.left,
      y: updatedPopupRect.top + newStyles.top,
    };

    if (updatedPosition.x < 0) {
      newStyles.left = 0;
    } else if (updatedPosition.x + updatedPopupRect.width > window.innerWidth) {
      newStyles.left += (window.innerWidth - (updatedPosition.x + updatedPopupRect.width));
    }

    if (updatedPosition.y < 0) {
      newStyles.top = 0;
    } else if (updatedPosition.y + updatedPopupRect.height > window.innerHeight) {
      newStyles.top += (window.innerHeight - (updatedPosition.y + updatedPopupRect.height));
    }

    setPopupStyles({
      left: `${newStyles.left}px`,
      position: newStyles.position || 'absolute',
      top: `${newStyles.top}px`,
    });
  };

  useEffect(() => {
    updatePopupPosition(placement);
    window.addEventListener('resize', () => updatePopupPosition(placement));
    return () => window.removeEventListener('resize', () => updatePopupPosition(placement));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placement]);

  useEffect(() => {
    window.addEventListener('scroll', () => updatePopupPosition(placement), true);
    return () => {
      window.removeEventListener('scroll', () => updatePopupPosition(placement), true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placement]);

  const checkCollisions = () => {
    updatePopupPosition(placement);
  };

  useEffect(() => {
    setPopupStylesFromProps?.(popupStyles);
  }, [popupStyles, setPopupStylesFromProps]);

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
