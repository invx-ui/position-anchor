import { useContext } from 'react';
import { PositionContext } from '../../Provider/context/index.js';

export const usePositionAnchor = (): PositionContext => useContext(PositionContext);
