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

2. Define permission for Cloudwatch to write to your loghandler:

```
resources:
  # AWS CloudFormation Template
  Resources:

    # IAM
    LoggingLambdaPermission:
      Type: AWS::Lambda::Permission
      Properties:
        FunctionName:
          Ref: LoghandlerLambdaFunction
        Action: lambda:InvokeFunction
        Principal: logs.amazonaws.com
```

3. If you don't already have a loghandler defined somewhere in your stack, do so.

```
functions:
  loghandler:
    description: 'CW Logs handler for Tasks'
    handler: handlers/loghandler/handler.handler
```

And that's all it takes. Now the logs of all your lambda functions will stream through that loghandler

## Acknowledgements
* Thanks to @andymac4182 for the [gist](https://gist.github.com/andymac4182/4837f722231ea493685f6b4699c939a1) that inspired this plugin.
* Thanks to @HyperBrain and the @serverless team
