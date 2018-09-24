
const { expect } = require('chai');
const Raven = require('raven');
const sinon = require('sinon');
const RavenWrapperFactory = require('./raven_wrapper.js');

describe('raven_wrapper', () => {
  let mockError;
  let consoleLogSpy;
  let stubbedRavenCaptureException;
  let ravenWrapperConfig;

  before(() => {
    const mockErrorMessage = 'mock error message';
    mockError = new Error(mockErrorMessage);
    consoleLogSpy = sinon.spy(console, 'log');
    stubbedRavenCaptureException = sinon.stub(Raven, 'captureException');
  });

  beforeEach(() => {
    consoleLogSpy.resetHistory();
    stubbedRavenCaptureException.resetHistory();

    ravenWrapperConfig = {
      environment: '',
      ravenConfig: {
        dsn: 'https://fakeravenaccount@sentry.io/fakeid',
        options: {
          captureUnhandledRejections: true,
        }
      }
    }
  });

  describe('logging and error handling in production', () => {
    it('should log exceptions with Raven when in production', async function () {
      ravenWrapperConfig.environment = 'production';
      const { logException } = RavenWrapperFactory(ravenWrapperConfig);
      mockError = new Error('error');
      logException(mockError, { level: 'warning'});

      expect(stubbedRavenCaptureException.calledOnceWithExactly(mockError, { level: 'warning'})).to.equal(true);
    });
  });

  describe('logging and error handling in development', () => {
    it('should log exception stack to the console when NOT in production', function () {
      ravenWrapperConfig.environment = 'development';
      const { logException } = RavenWrapperFactory(ravenWrapperConfig);
      logException(mockError);

      expect(consoleLogSpy.calledOnceWithExactly(mockError.stack)).to.equal(true);
    });
  });
});

