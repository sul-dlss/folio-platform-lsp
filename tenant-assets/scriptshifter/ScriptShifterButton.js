import {
  useRef,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

import {
  useCallout,
  useStripes,
} from '@folio/stripes/core';
import {
  Button,
  Checkbox,
  Dropdown,
  DropdownMenu,
  IconButton,
  Loading,
} from '@folio/stripes/components';

import {
  DEFAULT_SCRIPT_SHIFTER_URL,
  getScriptShifterLanguages,
  translateWithScriptShifter,
} from './ScriptShifter';

import css from './ScriptShifterButton.css';

const ScriptShifterButton = ({
  fieldId,
  text,
  onTranslate,
}) => {
  const intl = useIntl();
  const callout = useCallout();
  const stripes = useStripes();

  const scriptShifterUrl = stripes.config?.scriptShifterUrl || DEFAULT_SCRIPT_SHIFTER_URL;

  const hasFetchedLanguagesRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);
  const [languages, setLanguages] = useState(null);
  const [capitalize, setCapitalize] = useState(false);
  const [translatingKey, setTranslatingKey] = useState(null);

  const fetchLanguages = () => {
    if (hasFetchedLanguagesRef.current) {
      return;
    }

    hasFetchedLanguagesRef.current = true;
    setIsLoadingLanguages(true);

    getScriptShifterLanguages(scriptShifterUrl)
      .then(setLanguages)
      .catch(() => {
        hasFetchedLanguagesRef.current = false;

        callout.sendCallout({
          type: 'error',
          message: intl.formatMessage({ id: 'ui-quick-marc.record.scriptShifter.languagesError' }),
        });
      })
      .finally(() => setIsLoadingLanguages(false));
  };

  const handleToggle = () => {
    setOpen(wasOpen => {
      const willOpen = !wasOpen;

      if (willOpen) {
        fetchLanguages();
      }

      return willOpen;
    });
  };

  const handleTranslate = (langId, tDir) => {
    const translatingKeyValue = `${langId}-${tDir}`;

    setTranslatingKey(translatingKeyValue);

    translateWithScriptShifter(scriptShifterUrl, {
      text,
      lang: langId,
      tDir,
      capitalize: capitalize ? 'first_word' : 'no_change',
    })
      .then(result => {
        onTranslate(result.output);
        setOpen(false);
      })
      .catch(() => {
        callout.sendCallout({
          type: 'error',
          message: intl.formatMessage({ id: 'ui-quick-marc.record.scriptShifter.translateError' }),
        });
      })
      .finally(() => setTranslatingKey(null));
  };

  const renderMenu = () => (
    <DropdownMenu
      aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.scriptShifter.button' })}
      onToggle={handleToggle}
    >
      <Checkbox
        className={css.capitalizeOption}
        label={intl.formatMessage({ id: 'ui-quick-marc.record.scriptShifter.capitalize' })}
        checked={capitalize}
        onChange={() => setCapitalize(value => !value)}
      />
      {isLoadingLanguages && <Loading />}
      {!isLoadingLanguages && languages && (
        <div className={css.languageList}>
          {Object.entries(languages).map(([langId, lang]) => (
            <div
              key={langId}
              className={css.languageRow}
            >
              <span className={css.languageLabel}>{lang.label}</span>
              <span className={css.languageActions}>
                {lang.has_r2s && (
                  <Button
                    buttonStyle="menuItem"
                    marginBottom0
                    disabled={Boolean(translatingKey)}
                    onClick={() => handleTranslate(langId, 'r2s')}
                  >
                    {intl.formatMessage({ id: 'ui-quick-marc.record.scriptShifter.romanToScript' })}
                  </Button>
                )}
                {lang.has_s2r && (
                  <Button
                    buttonStyle="menuItem"
                    marginBottom0
                    disabled={Boolean(translatingKey)}
                    onClick={() => handleTranslate(langId, 's2r')}
                  >
                    {intl.formatMessage({ id: 'ui-quick-marc.record.scriptShifter.scriptToRoman' })}
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </DropdownMenu>
  );

  return (
    <Dropdown
      id={`script-shifter-dropdown-${fieldId}`}
      open={open}
      onToggle={handleToggle}
      renderTrigger={({ getTriggerProps }) => (
        <IconButton
          {...getTriggerProps()}
          icon="lightning"
          data-testid={`script-shifter-button-${fieldId}`}
          aria-label={intl.formatMessage({ id: 'ui-quick-marc.record.scriptShifter.button' })}
          disabled={!text?.trim()}
        />
      )}
      renderMenu={renderMenu}
    />
  );
};

ScriptShifterButton.propTypes = {
  fieldId: PropTypes.string.isRequired,
  text: PropTypes.string,
  onTranslate: PropTypes.func.isRequired,
};

export { ScriptShifterButton };
