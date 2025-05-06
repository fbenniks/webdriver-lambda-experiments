# Restore State to Selenium WebDriver Experiment

This project demonstrates restoring the state of a React website using Selenium WebDriver across multiple invocations. The state includes session storage, cookies, and localStorage.

## Restored Data

This experiment demonstrates restoring the following types of data for the React website:

| Data Type                             | Restored | Notes                                                                  |
|---------------------------------------|----------|------------------------------------------------------------------------|
| **Session Storage**                   | ✅       | Data stored for the current browser session.                           |
| **Cookies**                           | ✅       | Includes HTTP and JavaScript-accessible cookies.                       |
| **LocalStorage**                      | ✅       | Persistent data stored in the browser.                                 |
| **Geo, camera, mic,ect Permissions** | ❌       | Not yet implemented in this experiment, but doable!                    |
| **IndexedDB**                         | ❌       | Might be complex because of the  data structure for different websites |  

The data is currently stored in S3 bucket, and the Lambda function retrieves it when needed. The data is stored in JSON format, making it easy to read and manipulate.
The data storage is in adapter form and can be changed to any store solution required(for example dynamodb or memcache/redis).

## React Website
The React website is a basic React Bootstrap application with three buttons to store data in session storage, cookies, and localStorage. It is hosted on S3 and served via CloudFront.

## CDK Deployment
The project is deployed using AWS CDK in TypeScript. It consists of two stacks:

### ReactSiteCdkStack
This stack deploys the React website to an S3 bucket and serves it through a CloudFront distribution.

- **S3 Bucket**: Stores the React website's static files.
- **CloudFront Distribution**: Provides secure and fast access to the website.
- **Deployment**: The `build/` folder of the React app is deployed to the S3 bucket.

### SeleniumRunnersCdkStack
This stack sets up a Lambda function that runs Selenium WebDriver to interact with the React website and store/retrieve state data in an S3 bucket.

- **S3 Bucket**: Used to store WebDriver state data.
- **Lambda Function**: Runs Selenium WebDriver with a custom Chromium layer.
    - **Environment Variables**:
        - `URL`: The URL of the React website.
        - `S3_WEBDRIVER_DATA_BUCKET`: The name of the S3 bucket for storing state data.
        - `FONTCONFIG_PATH`: Path for font configuration.
    - **Custom Chromium Layer**: Includes a headless Chromium browser and WebDriver.

## Prerequisites
- Node.js and npm installed.
- AWS CLI configured.
- AWS CDK installed globally.

## Deployment Steps
1. Build the React app:
   ```bash
   npm run deploy
    ```

## Local Testing

You can test the Lambda function locally by setting up a `.env` file in the root of the project. The `.env` file should include the necessary environment variables, such as `AWS_PROFILE`, to configure your AWS credentials.

Example `.env` file:
```bash
AWS_PROFILE=default
AWS_REGION=us-east-1
URL=https://d241m574llre88.cloudfront.net
S3_WEBDRIVER_DATA_BUCKET=seleniumrunnerscdkstack-seleniumrunnerscdkbucketc2-plnkitv3w858
```


To run the Lambda function locally, use the `test/local-runner-webdriver-experiment.ts` script:
```bash
ts-node test/local-runner-webdriver-experiment.ts
```

## Cloud testing:
Deploy the stacks and navigate to the CloudFormation console to find the Lambda function. You can invoke the function from the AWS console or use the AWS CLI.

## Validating Data Restore

The logic pushes state to an array, and at the end of the invocation, the state is printed.

### First Invocation
When no state is recorded, the system prints:

```json
[
  "Session did not exists, setting it now: Session label: Hello session 808",
  "Cookie did not exists, setting it now: Cookie label: Hello cookie 31",
  "Localstorage did not exists, setting it now: LocalStorage label: Hello localStorage 248"
]
```

When the code is invoced a second time it shows that the data is already known:
```json
[
'Session already exists: Session label: Hello session 146',
'Cookie already exists: Cookie label: Hello cookie 969',
'Localstorage already exists: LocalStorage label: Hello localStorage 344'
]
```
