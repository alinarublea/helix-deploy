/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-env mocha */
const { Response } = require('@adobe/helix-fetch');
const assert = require('assert');
const proxyquire = require('proxyquire').noCallThru();

describe('Wrapper tests for Azure', () => {
  it('context.pathInfo.suffix', async () => {
    const azure = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (request, context) => {
          assert.equal(context.env.FOO, 'bar');
          assert.equal(context.pathInfo.suffix, '/foo');
          assert.ok(request);
          return new Response('okay');
        },
      },
      './params.json': {
        FOO: 'bar',
      },
    });

    const context = {
      // eslint-disable-next-line no-console
      log: console.log,
      executionContext: {
        functionName: 'simple-package--simple-name_1_45_0',
      },
    };
    const request = {
      url: 'https://deploy-helix.azurewebsites.net/api/simple-package/simple-name/1.45.0/foo',
      headers: {},
    };

    await azure(context, request);
    assert.equal(context.res.status, 200, context.res.body);
  });
});

describe('Wrapper tests for AWS', () => {
  it('context.func', async () => {
    const { lambda } = proxyquire('../src/template/index.js', {
      './main.js': {
        main: (request, context) => {
          assert.deepEqual(context.func, {
            name: 'dump',
            version: '4.3.1',
            app: 'kvvyh7ikcb',
          });
          return new Response('ok');
        },
      },
      './aws-package-params.js': () => ({}),
    });

    const event = {
      version: '2.0',
      routeKey: 'ANY /dump',
      rawPath: '/dump',
      rawQueryString: '',
      headers: {
        accept: '*/*',
        'content-length': '0',
        host: 'kvvyh7ikcb.execute-api.us-east-1.amazonaws.com',
        'user-agent': 'curl/7.64.1',
        'x-amzn-trace-id': 'Root=1-603df0bb-05e846307a6221f72030fe68',
        'x-forwarded-for': '210.153.232.90',
        'x-forwarded-port': '443',
        'x-forwarded-proto': 'https',
      },
      requestContext: {
        accountId: '118435662149',
        apiId: 'kvvyh7ikcb',
        domainName: 'kvvyh7ikcb.execute-api.us-east-1.amazonaws.com',
        domainPrefix: 'kvvyh7ikcb',
        http: {
          method: 'GET',
          path: '/dump',
          protocol: 'HTTP/1.1',
          sourceIp: '210.153.232.90',
          userAgent: 'curl/7.64.1',
        },
        requestId: 'bjKNYhHcoAMEJIw=',
        routeKey: 'ANY /dump',
        stage: '$default',
        time: '02/Mar/2021:08:00:59 +0000',
        timeEpoch: 1614672059918,
      },
      isBase64Encoded: false,
    };

    const context = {
      getRemainingTimeInMillis: () => 30000,
      callbackWaitsForEmptyEventLoop: true,
      functionVersion: '$LATEST',
      functionName: 'dump',
      memoryLimitInMB: '128',
      logGroupName: '/aws/lambda/dump',
      logStreamName: '2021/03/02/[$LATEST]89b58159f93949f787eb8de043937bbb',
      invokedFunctionArn: 'arn:aws:lambda:us-east-1:118435662149:function:dump:4_3_1',
      awsRequestId: '535f0399-9c90-4042-880e-620cfec6af55',
    };

    const res = await lambda(event, context);
    assert.equal(res.statusCode, 200);
  });
});
