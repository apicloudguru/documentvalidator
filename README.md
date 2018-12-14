# Document Validator

## Overview

This is an Apigee Proxy that implements a simple document validation solution.

Note that you do not need to deploy this in order to test the functioanlity. You can run calls against this using

http://amer-demo27-test.apigee.net/validator/documemts

Run POST calls to this URL with various "Wonka Visitor" JSON documents

## Deploying to Apigee

To deploy this you will need access to an Apigee Edge instance. You can register for a free developer account
at https://apigee.com/api-management/#/homepage.

1. Download the [DocumentValidator.zip](/blob/master/documentvalidator_rev1_2018_12_14.zip) file
2. Login to your Apigee instance
3. Click the **Develop** icon on the left bar menu (first icon beneath your account name)
4. Click **API Proxies**
5. Click the **+Proxy** button located in the upper right
6. Choose **Proxy Bundle** from the list of choices
7. Click **Next**
8. Click the **Choose File** button
9. Select the file you saved in Step 1
10. Enter a different proxy name if desired
11. Click **Next**
12. Choose the desired permissions scope -- ***Use my organization's default permissions*** is the default, and will be fine
13. Click **Build**
14. You can now view the new proxy in the editor

## Testing Using Postman

You can use the Postman collection to set up testing the validator APIs. 

Install and open Postmamn, then import the collection [DocumentValidatorCollection.json](/blob/master/DocumentValidator.json)

You can now run the tests againat the endpoint above. If you want to run against your own deployment in Apigee modify the environment variable for basePath to the appropriate path.

## Viewing Doc Validation Logic

If you want to see the logic used for validating the document, you can look [validate-document.js] (/blob/master/validate-document.js). Note that this won't work unless deployed to Apigee as part of the proxy. But it should givve you a good idea of how the validation logic was implemented.
