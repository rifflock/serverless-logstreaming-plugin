# ⚡️ Serverless Logstreaming Plugin

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![npm](https://img.shields.io/npm/v/logstreaming.svg)](https://www.npmjs.com/package/serverless-logstreaming)
[![license](https://img.shields.io/github/license/rifflock/serverless-logstreaming-plugin.svg)](https://github.com/rifflock/serverless-logstreaming-plugin/blob/master/LICENSE)
[![dependencies](https://img.shields.io/david/rifflock/serverless-logstreaming-plugin.svg)](https://www.npmjs.com/package/serverless-logstreaming)


## About
This Serverless plugin allows for simple streaming of logs through a given function
with the popular [Serverless Framework](https://serverless.com) and AWS Lambda.

## Configuration

1. Add `serverless-logstreaming` to your `serverless.yml` file in the root of your serverless project

```
plugins:
  - serverless-logstreaming
```

2. Define your loghandler function:

```
functions:
  myLogHandler:
    description: 'CW Logs handler for Tasks'
    handler: handlers/myLogHandler/handler.handler
```

3. Reference the name of your loghandler function in the custom section:

```
custom:
  logHandler:
    function: myLogHandler
```

And that's all it takes. Now the logs of all your lambda functions will stream through that loghandler.

If you have a function where you _don't_ want to stream logs through the loghandler it's as simple as adding an exception:

```
functions:
  handlerToNotStream:
    description: 'This lambda should not stream logs'
    loghandler: false
```

That `loghandler: false` will exempt this lambda from streaming through the loghandler function.

## Changelog
* 1.1.0 - Add logstreaming permission by default instead of requiring user to do so, add flexibility in naming
* 1.0.0 - Initial commit.

## Acknowledgements
* Thanks to @andymac4182 for the [gist](https://gist.github.com/andymac4182/4837f722231ea493685f6b4699c939a1) that inspired this plugin.
* Thanks to @HyperBrain and the @serverless team
