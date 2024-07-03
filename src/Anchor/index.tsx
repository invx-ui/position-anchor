import React, { ElementType, HTMLProps } from 'react';
import { usePositionAnchor } from '../hooks/index.js';

export interface AnchorProps extends HTMLProps<HTMLElement> {
  htmlElement?: ElementType
  children?: React.ReactNode
}

export const Anchor: React.FC<AnchorProps> = (props) => {
  const {
    className,
    htmlElement: Tag = 'button',
    children,
    ...rest
  } = props;

  const {
    rootClass,
    id: idFromContext,
    setAnchorRef,
  } = usePositionAnchor();

  const baseClass = `${rootClass}__content`;

  const mergedClasses = [
    baseClass,

    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag
      ref={setAnchorRef}
      id={`position-anchor_${idFromContext}`}
      aria-labelledby={`position-anchor_${idFromContext}`}
      {...rest}
      className={mergedClasses}
    >
      {children}
    </Tag>
  );
};
