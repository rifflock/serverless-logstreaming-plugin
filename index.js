"use strict";

const _ = require("lodash");

const cloudwatchLogsSubscriptionFilterTemplate = {
	Type: "AWS::Logs::SubscriptionFilter",
	DependsOn: "LoggingLambdaPermission",
	Properties: {
		LogGroupName: "LogGroup",
		FilterPattern: "{ $.TestForValidJson NOT EXISTS }",
		DestinationArn: {
			"Fn::GetAtt": [
				"LoghandlerLambdaFunction",
				"Arn"
			]
		}
	}
};

class LogStreamingPlugin {

	constructor(serverless, options) {
		this.serverless = serverless;
		this.options = options;

		this.hooks = {
			"after:deploy:compileFunctions": this.logServerless.bind(this)
		};
	}

	logServerless() {
		let logHandlerLambdaName;
		const logHandlerFnName = _.get(this.serverless, "service.custom.logHandler.function", "loghandler");
		_.forEach(this.serverless.service.getAllFunctions(), functionName => {
			const functionLogicalId = `${_.upperFirst(functionName)}LambdaFunction`;
			if (functionName === logHandlerFnName) {
				// Do not add the loghandler to itself.
				logHandlerLambdaName = functionLogicalId;
				return;
			}
			const functionObject = this.serverless.service.getFunction(functionName);
			if (_.get(functionObject, "loghandler", true) === false) {
				// If the loghandler property is set to false then do not create a loghandler
				return;
			}
			cloudwatchLogsSubscriptionFilterTemplate.Properties.LogGroupName = `/aws/lambda/${functionObject.name}`;
			const newResources = {
				[`${functionLogicalId}SubscriptionFilter`]: cloudwatchLogsSubscriptionFilterTemplate
			};

			_.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, newResources);
		});
		
		if (!_.has(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, "LoggingLambdaPermission")) {
			if (!logHandlerLambdaName || !logHandlerFnName) {
				throw new Error("Loghandler plugin is not properly configured. Missing loghandler function definition.");
			}
			const loggingPermissions = {
				["LoggingLambdaPermission"]: {
					Type: "AWS::Lambda::Permission",
					Properties: {
						FunctionName: logHandlerLambdaName,
						Action: "lambda:InvokeFunction",
						Principal: "logs.amazonaws.com"
					}
				}
			};
			this.serverless.cli.log(`Adding 'LoggingLambdaPermission' to Resources with FunctionName ${logHandlerLambdaName}`);
			_.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, loggingPermissions);
		}
	}
}

module.exports = LogStreamingPlugin;
