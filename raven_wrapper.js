
const Raven = require('raven');

module.exports = (ravenWrapperConfig) => {
  let logException;
  let wrapperToHandleUnhandledExceptions;

  const setUpRaven = () => {
    console.log(ravenWrapperConfig.ravenConfig);
    Raven.config(ravenWrapperConfig.ravenConfig).install();
  };

  const setUpHandlingExceptionsRejectionsProdEnv = () => {
    setUpRaven();

    logException = (exception, additionalInfo) => {
      Raven.captureException(exception, additionalInfo);
    };

    wrapperToHandleUnhandledExceptions = Raven.context.bind(Raven);
  };

  const wrapperToHandleUnhandledExceptionsDev = (functionToWrap) => {
    process.on('uncaughtException', (error) => {
      console.error(error.stack);
      process.exit();
    });

    process.on('unhandledRejection', (error) => {
      console.log('unhandledRejection', error.stack);
      process.exit();
    });

    functionToWrap();
  };

  const setUpHandlingExceptionsRejectionsDevEnv = () => {
    logException = (exception) => {
      console.log(exception.stack);
    };

    wrapperToHandleUnhandledExceptions = wrapperToHandleUnhandledExceptionsDev;
  };


  if (ravenWrapperConfig.environment !== 'development') {
    setUpHandlingExceptionsRejectionsProdEnv();
  } else {
    setUpHandlingExceptionsRejectionsDevEnv();
  }

  return { logException, wrapperToHandleUnhandledExceptions };
};

