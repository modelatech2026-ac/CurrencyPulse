import React from 'react';
import { CurrencySearchModal, CurrencySearchModalProps } from './CurrencySearchModal';

export type CurrencyPickerModalProps = CurrencySearchModalProps;

export const CurrencyPickerModal: React.FC<CurrencyPickerModalProps> = (props) => {
  return <CurrencySearchModal {...props} />;
};

export default CurrencyPickerModal;
