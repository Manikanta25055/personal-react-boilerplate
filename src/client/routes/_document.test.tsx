import theme from '@chakra-ui/theme';
import NextDocument, { DocumentProps } from 'next/document';
import { isValidElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { PageProps } from '../../../pages/_app';
import Document from '../../../pages/_document';
import { i18nCache } from '../../server/i18n';
import * as sentryUtils from '../../utils/sentry/client';

const pageProps: PageProps = {
  i18nBundle: i18nCache.en,
  // @ts-expect-error Chakra issue, fixed soon
  initialColorMode: theme.config.initialColorMode,
  language: 'en',
  session: null,
};

const defaultProps: DocumentProps = {
  __NEXT_DATA__: {
    appGip: true,
    buildId: Math.floor(Math.random() * 1000).toString(),
    page: '/',
    props: { pageProps },
    query: {},
  },
  ampPath: '/',
  buildManifest: {
    ampDevFiles: [],
    ampFirstPages: [],
    devFiles: [],
    lowPriorityFiles: [],
    pages: {
      '/_app': [],
    },
    polyfillFiles: [],
  },
  canonicalBase: '/',
  dangerousAsPath: '/',
  dynamicImports: [],
  files: [],
  headTags: [],
  html: '',
  hybridAmp: false,
  inAmpMode: false,
  isDevelopment: false,
};

describe('<Document />', () => {
  it('renders without crashing given default props', () => {
    // @ts-expect-error next types are not entirely compatible with a Document
    // function component
    const html = Document.renderDocument(Document, defaultProps);

    expect(isValidElement(html)).toBeTruthy();
  });

  it('uses getInitialProps of NextDocument', () => {
    expect(Document.getInitialProps).toBe(NextDocument.getInitialProps);
  });

  it('uses renderDocument of NextDocument', () => {
    expect(Document.renderDocument).toBe(NextDocument.renderDocument);
  });

  it('attaches a breadcrumb to Sentry', () => {
    const attachComponentBreadcrumbSpy = jest.spyOn(
      sentryUtils,
      'attachComponentBreadcrumb'
    );

    renderToStaticMarkup(
      // @ts-expect-error next types are not entirely compatible with a Document
      // function component
      Document.renderDocument(Document, defaultProps)
    );

    expect(attachComponentBreadcrumbSpy).toHaveBeenCalledWith('document');
  });

  /**
   * not the best tests below, but I didn't want to add dom-parser or cheerio
   */
  it('sets "language" attribute on html tag', () => {
    const text = renderToStaticMarkup(
      // @ts-expect-error next types are not entirely compatible with a Document
      // function component
      Document.renderDocument(Document, defaultProps)
    );

    expect(text.includes(`lang="${pageProps.language}"`)).toBeTruthy();
  });

  it('sets "dir" attribute on html tag', () => {
    const text = renderToStaticMarkup(
      // @ts-expect-error next types are not entirely compatible with a Document
      // function component
      Document.renderDocument(Document, defaultProps)
    );

    expect(text.includes('dir="auto"')).toBeTruthy();
  });

  it('links manifest.json', () => {
    const text = renderToStaticMarkup(
      // @ts-expect-error next types are not entirely compatible with a Document
      // function component
      Document.renderDocument(Document, defaultProps)
    );

    expect(text.includes('rel="manifest"')).toBeTruthy();
  });
});
