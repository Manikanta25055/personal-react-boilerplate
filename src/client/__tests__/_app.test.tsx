import * as sentryReact from '@sentry/react';
import { render, screen } from '@testing-library/react';
import { Router } from 'next/router';
import React from 'react';

import 'whatwg-fetch';

import type { AppRenderProps } from '../../../pages/_app';
import App, { reportWebVitals } from '../../../pages/_app';
import { MockRouterContext } from '../../../testUtils/router';
import { createMockScope } from '../../../testUtils/sentry';
import * as sentryUtils from '../../utils/sentry/client';
import type { WithLayoutHandler } from '../Karma';

const defaultProps: AppRenderProps = {
  Component: () => null,
  pageProps: {
    karma: {
      auth: {
        session: null,
      },
      cookies: '',
      i18n: {
        bundle: {},
        language: 'en',
      },
    },
  },
  router: new Router('/', {}, '', {
    App: () => null,
    Component: () => null,
    initialProps: {},
    initialStyleSheets: [],
    isFallback: false,
    pageLoader: undefined,
    subscription: jest.fn(),
    wrapApp: jest.fn(),
  }),
};

describe('<App />', () => {
  it('renders without crashing given default props', () => {
    render(<App {...defaultProps} />, {
      wrapper: ({ children }) => (
        <MockRouterContext>{children}</MockRouterContext>
      ),
    });
  });

  it('supports persistent layouts', () => {
    const content = 'next-karma with persistent layouts';
    const layoutTestId = 'layout';

    function DummyComponent() {
      return <h1>{content}</h1>;
    }

    const withLayout: WithLayoutHandler = (page) => (
      <main data-testid={layoutTestId}>{page}</main>
    );

    DummyComponent.withLayout = withLayout;

    render(<App {...defaultProps} Component={DummyComponent} />, {
      wrapper: ({ children }) => (
        <MockRouterContext>{children}</MockRouterContext>
      ),
    });

    const contentElement = screen.getByText(content);
    const layoutElement = screen.getByTestId(layoutTestId);

    expect(contentElement).toBeInTheDocument();
    expect(layoutElement).toBeInTheDocument();

    expect(contentElement.parentElement).toBe(layoutElement);
  });

  it('attaches routing breadcrumbs to Sentry', () => {
    const attachRoutingContextSpy = jest.spyOn(
      sentryUtils,
      'attachRoutingContext'
    );

    const setContextSpy = jest.fn();
    const configureScopeSpy = jest
      .spyOn(sentryReact, 'configureScope')
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      .mockImplementationOnce((callback) =>
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        callback(createMockScope({ setContext: setContextSpy }))
      );

    render(<App {...defaultProps} />, {
      wrapper: ({ children }) => (
        <MockRouterContext>{children}</MockRouterContext>
      ),
    });

    expect(attachRoutingContextSpy).toHaveBeenCalledTimes(1);
    expect(attachRoutingContextSpy).toHaveBeenCalledWith(
      expect.any(Router),
      defaultProps.Component
    );

    expect(configureScopeSpy).toHaveBeenCalledTimes(1);
    expect(setContextSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        asPath: expect.any(String),
        pathname: expect.any(String),
        query: expect.any(Object),
        route: expect.any(String),
      })
    );
  });
});

describe('reportWebVitals', () => {
  it('attaches context on @sentry/browser', () => {
    const mockMetric = {
      id: '',
      label: '',
      name: '',
      startTime: Date.now(),
      value: 1,
    };

    const setContextSpy = jest.fn();
    const configureScopeSpy = jest
      .spyOn(sentryReact, 'configureScope')
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      .mockImplementationOnce((callback) =>
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        callback(createMockScope({ setContext: setContextSpy }))
      );

    reportWebVitals(mockMetric);

    expect(configureScopeSpy).toHaveBeenCalledTimes(1);
    expect(setContextSpy).toHaveBeenCalledWith(expect.any(String), mockMetric);
  });
});
