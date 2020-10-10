import { Box, useToast, Flex, Icon } from '@chakra-ui/core';
import type { TFunction } from 'i18next';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaInfoCircle } from 'react-icons/fa';

import { IS_PROD } from '../../../src/constants';
import { attachComponentBreadcrumb } from '../../utils/sentry/client';

const sw = '/service-worker.js';

type RefreshToastProps = {
  t: TFunction;
};

const handleClick = () => {
  window.location.reload();
};

/**
 * Currently mimics toast({status: 'info'}) to allow a global onClick
 */
function RefreshToast({ t }: RefreshToastProps) {
  return (
    <Flex
      backgroundColor="blue.500"
      borderRadius="0.25rem"
      cursor="pointer"
      mb={4}
      onClick={handleClick}
      pb={3}
      pl={4}
      pr={8}
      pt={3}
      role="alert"
      color="white"
    >
      <Icon as={FaInfoCircle} height={6} width={6} mr={3} />
      <Box textAlign="left">
        <Box as="p" fontWeight="bold">
          {t('newVersion')}
        </Box>
        {t('clickToRefresh')}
      </Box>
    </Flex>
  );
}

export function ServiceWorker(): null {
  const { t } = useTranslation('serviceWorker');
  const toast = useToast();
  // required to not re-register when e.g. language is changed and thus `t`
  const attemptedRegistration = useRef(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && !attemptedRegistration.current) {
      attachComponentBreadcrumb('ServiceWorker');
      attemptedRegistration.current = true;

      navigator.serviceWorker
        .register(sw)
        // eslint-disable-next-line promise/prefer-await-to-then
        .then((registration) => {
          const onUpdateFound = createOnUpdateFoundListener({
            registration,
            t,
            toast,
          });

          registration.addEventListener('updatefound', onUpdateFound);
        })
        .catch((error) => {
          if (!IS_PROD && error instanceof TypeError) {
            // eslint-disable-next-line no-console
            console.info(
              'ServiceWorker is currently deactivated.\nIf this is unintentional, please change `next.config.js.offlineConfig.generateInDevMode` to `true`.'
            );

            return;
          }

          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  }, [toast, t, attemptedRegistration]);

  return null;
}

type CreateOnStateChangeListenerParams = {
  toast: ReturnType<typeof useToast>;
  t: TFunction;
  installingWorker: ServiceWorker;
};

const createOnStateChangeListener = ({
  toast,
  t,
  installingWorker,
}: CreateOnStateChangeListenerParams) => () => {
  if (
    installingWorker.state !== 'installed' ||
    !navigator.serviceWorker.controller
  ) {
    return;
  }

  toast({
    // eslint-disable-next-line react/display-name
    render: () => <RefreshToast t={t} />,
  });
};

type CreateOnUpdateFoundListenerParams = {
  toast: ReturnType<typeof useToast>;
  registration: ServiceWorkerRegistration;
  t: TFunction;
};

const createOnUpdateFoundListener = ({
  toast,
  registration,
  t,
}: CreateOnUpdateFoundListenerParams) => () => {
  const installingWorker = registration.installing;

  if (!installingWorker) {
    return;
  }

  const onStateChange = createOnStateChangeListener({
    installingWorker,
    t,
    toast,
  });

  installingWorker.addEventListener('statechange', onStateChange);
};
