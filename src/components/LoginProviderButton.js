import { useIdentityContext } from 'react-netlify-identity';

import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Button } from 'rbx';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../hooks';
import { upperCaseFirstCharacter } from '../utils';

import Icon from './Icon';

/**
 * @param {{
 * provider: 'google' | 'github'
 * }}
 */
export default function LoginProviderButton({ provider }) {
  const { loginProvider } = useIdentityContext(provider);
  const { t } = useTranslation('registration');
  const { theme } = useTheme();

  return (
    <Button
      type="button"
      color={theme === 'light' ? 'info' : undefined}
      onClick={() => loginProvider(provider)}
      fullwidth
    >
      <Icon icon={provider === 'github' ? faGithub : faGoogle} />{' '}
      <span>
        {t('signInViaProvider', {
          provider: upperCaseFirstCharacter(provider),
        })}
      </span>
    </Button>
  );
}
