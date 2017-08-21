"use strict";

const _ = require("lodash");


class LogStreamingPlugin {

	constructor(serverless, options) {
		this.serverless = serverless;
		this.options = options;
		this.provider = this.serverless.getProvider("aws");

		this.hooks = {
			"after:deploy:compileFunctions": this.logServerless.bind(this)
		};
	}

	logServerless() {
		const logHandlerFnName = _.get(this.serverless, "service.custom.logHandler.function", "loghandler");
		const logHandlerLogicalId = this.provider.naming.getLambdaLogicalId(logHandlerFnName);
		const cloudwatchLogsSubscriptionFilterTemplate = {
			Type: "AWS::Logs::SubscriptionFilter",
			DependsOn: "LoggingLambdaPermission",
			Properties: {
				LogGroupName: "LogGroup",
				FilterPattern: "{ $.TestForValidJson NOT EXISTS }",
				DestinationArn: {
					"Fn::GetAtt": [
						logHandlerLogicalId,
						"Arn"
					]
				}
			}
		};

		_.forEach(this.serverless.service.getAllFunctions(), functionName => {
			const functionLogicalId = this.provider.naming.getLambdaLogicalId(functionName);
			if (functionName === logHandlerFnName) {
				// Do not add the loghandler to itself.
				return;
			}
			const functionObject = this.serverless.service.getFunction(functionName);
			if (_.get(functionObject, "loghandler", true) === false) {
				// If the loghandler property is set to false then do not create a loghandler
				return;
			}
			const logGroupLogicalId = this.provider.naming.getLogGroupName(functionObject.name);
			cloudwatchLogsSubscriptionFilterTemplate.Properties.LogGroupName = logGroupLogicalId;
			const newResources = {
				[`${functionLogicalId}SubscriptionFilter`]: cloudwatchLogsSubscriptionFilterTemplate
			};

			_.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, newResources);
		});

		if (!_.has(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, "LoggingLambdaPermission")) {
			if (!logHandlerLogicalId || !logHandlerFnName) {
				throw new Error("Loghandler plugin is not properly configured. Missing loghandler function definition.");
			}
			const loggingPermissions = {
				["LoggingLambdaPermission"]: {
					Type: "AWS::Lambda::Permission",
					Properties: {
						FunctionName: logHandlerLogicalId,
						Action: "lambda:InvokeFunction",
						Principal: "logs.amazonaws.com"
					}
				}
			};
			this.serverless.cli.log(`Adding 'LoggingLambdaPermission' to Resources with FunctionName ${logHandlerLogicalId}`);
			_.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, loggingPermissions);
		}
	}
}

module.exports = LogStreamingPlugin;
