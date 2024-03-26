import React, { ElementType, HTMLProps } from 'react';
import { usePositionAnchor } from '../hooks/index.js';

export interface PopupProps extends HTMLProps<HTMLElement> {
  htmlElement?: ElementType
  children?: React.ReactNode
}

export const Popup: React.FC<PopupProps> = (props) => {
  const {
    className,
    htmlElement: Tag = 'div',
    children,
    ...rest
  } = props;


  const {
    rootClass,
    id: idFromContext,
    setPopupRef,
    popupStyles,
  } = usePositionAnchor();

  const baseClass = `${rootClass}__content`;

  const mergedClasses = [
    baseClass,

    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      ref={setPopupRef}
      id={`position-popup${idFromContext}`}
      aria-labelledby={`position-popup_${idFromContext}`}
      role="region"
      {...rest}
      className={mergedClasses}
      style={{
        ...popupStyles,
        ...rest.style,
      }}
    >
      {children}
    </Tag>
  );
};
