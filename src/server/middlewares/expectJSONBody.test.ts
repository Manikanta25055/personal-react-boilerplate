import nextConnect from 'next-connect';

import { testLambda, RequestMethods } from '../../../testUtils/lambda';
import { OK, BAD_REQUEST } from '../../utils/statusCodes';
import { RequestHandler } from '../types';
import expectJSONBodyMiddleware from './expectJSONBody';

const dummyHandler: RequestHandler = (req, res) => {
  return res.json({ isObject: req.body instanceof Object });
};

describe('middleware/expectJSONBody', () => {
  test('should be a function', () => {
    expect(expectJSONBodyMiddleware).toBeInstanceOf(Function);
  });

  RequestMethods.filter(method => !['GET', 'HEAD'].includes(method)).forEach(
    method => {
      test(`never intercepts lambda without a body present (method: ${method})`, async () => {
        const response = await testLambda(nextConnect().use(dummyHandler), {
          method,
          middleware: expectJSONBodyMiddleware,
          url: '/',
        });

        expect(response.status).toBe(OK);
      });

      test(`always intercepts lambda with a body present (method: ${method})`, async () => {
        const response = await testLambda(nextConnect().use(dummyHandler), {
          body: { foo: 'bar' },
          method,
          middleware: expectJSONBodyMiddleware,
          url: '/',
        });

        expect(response.status).toBe(OK);
      });

      test(`always responds with BAD_REQUEST given an invalid body (method: ${method})`, async () => {
        const response = await testLambda(nextConnect().use(dummyHandler), {
          body: '{"foo": 1,}',
          method,
          middleware: expectJSONBodyMiddleware,
          url: '/',
        });

        expect(response.status).toBe(BAD_REQUEST);
      });

      test(`always parses a valid body into a JSON and assigns it to req.body (method: ${method})`, async () => {
        const response = await testLambda(nextConnect().use(dummyHandler), {
          body: { foo: 'bar' },
          method,
          middleware: expectJSONBodyMiddleware,
          url: '/',
        });

        const json = await response.json();

        expect(json).toMatchObject({ isObject: true });
      });
    }
  );
});