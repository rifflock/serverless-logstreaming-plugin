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
		_.forEach(this.serverless.service.getAllFunctions(), functionName => {
			if (functionName === "loghandler") {
				return;
			}
			const functionLogicalId = `${_.upperFirst(functionName)}LambdaFunction`;
			const functionObject = this.serverless.service.getFunction(functionName);

			cloudwatchLogsSubscriptionFilterTemplate.Properties.LogGroupName = `/aws/lambda/${functionObject.name}`;
			const newResources = {
				[`${functionLogicalId}SubscriptionFilter`]: cloudwatchLogsSubscriptionFilterTemplate
			};

			_.merge(this.serverless.service.provider.compiledCloudFormationTemplate.Resources, newResources);
			
		});
	}
}

module.exports = LogStreamingPlugin;
