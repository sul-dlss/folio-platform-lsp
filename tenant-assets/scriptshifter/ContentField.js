import React, {
  useRef,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';

import {
  TextArea,
  HasCommand,
} from '@folio/stripes/components';

import { useSubfieldNavigation } from '../../../hooks/useSubfieldNavigation';
import { getResizeStyles } from './utils';
import { ScriptShifterButton } from './ScriptShifterButton';

import css from './ContentField.css';

export const ContentField = ({
  input,
  id,
  fieldId,
  withScriptShifter,
  ...props
}) => {
  const ref = useRef();

  const {
    keyCommands,
    processSubfieldFocus,
  } = useSubfieldNavigation();

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.height = '0';

      const resizeStyles = getResizeStyles(ref.current);

      Object.keys(resizeStyles).forEach(property => {
        ref.current.style[property] = resizeStyles[property];
      });
    }
  }, [ref, input.value]);

  const textArea = (
    <TextArea
      {...props}
      input={input}
      inputRef={ref}
      data-testid={id}
      onFocus={processSubfieldFocus}
    />
  );

  return (
    <HasCommand commands={keyCommands}>
      {withScriptShifter ? (
        <div className={css.contentFieldWrapper}>
          {textArea}
          <ScriptShifterButton
            fieldId={fieldId}
            text={input.value}
            onTranslate={input.onChange}
          />
        </div>
      ) : textArea}
    </HasCommand>
  );
};

ContentField.propTypes = {
  id: PropTypes.string.isRequired,
  fieldId: PropTypes.string,
  withScriptShifter: PropTypes.bool,
  input: PropTypes.shape({
    value: PropTypes.string,
    onChange: PropTypes.func,
  }),
};
