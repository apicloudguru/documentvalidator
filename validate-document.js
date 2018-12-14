//submitted doc
var doc = JSON.parse(context.getVariable("docs.theDoc"));

// doc compliance state
var oldDocState = JSON.parse(context.getVariable("docs.oldDocState"));
var hasDocState = Boolean(oldDocState);

//processing vars
var currentTimestamp = Date.now();
var newExpiry = currentTimestamp + 60000;
var httpStatusCode = "200";
var httpStatusReasonPhrase = "Document is compliant";
var compliant = true;
var hasValidId = true;
var docStateId = "wonka_" + doc.id;

//initialize objects
var response = {};
var requirements = [];
var pastDue = [];
var newDocState = {};
var newReqs = [];


// check doc compliance and populate the requirements array

wonkaVisitorValidate();

// populate pastDue aeray and newReqs array
setNewComplianceReqs();

response = {
    compliant: compliant,
    requirements: requirements,
    past_due: pastDue
};

newDocState = {
    id: doc.id,
    requirements: newReqs
}; 

setVars();


function setNewComplianceReqs() {
    var newReq;
    var fields = [];
    if (hasDocState) {
        for (var o in oldDocState.requirements) {
            var field = oldDocState.requirements[o].field;
            var expiry = oldDocState.requirements[o].expiry;
            var timestamp = oldDocState.requirements[o].timestamp;
            //  Is this still a non-compliant field?
            if (requirements.indexOf(field) > -1) {
                if (expiry < currentTimestamp) {
                    pastDue.push(field);
                }
                newReq = {
                    field: field,
                    timestamp: timestamp,
                    expiry: expiry
                };
                newReqs.push(newReq);
                fields.push(field);
            }
        }
        for (var n in requirements) {
            // if this requirement wasn't already added above, let's add it now
            if (fields.indexOf(requirements[n]) == -1) {
                print("we are in line 70");
                newReq = {
                    field: requirements[n],
                    timestamp: currentTimestamp,
                    expiry: newExpiry
                };
                newReqs.push(newReq);
            }
        }
    } else {
        for (var i in requirements) {
            newReq = {
                field: requirements[i],
                timestamp: currentTimestamp,
                expiry: newExpiry
            };
            newReqs.push(newReq);
        }
    }
}



function wonkaVisitorValidate() {
    // first_name must be non empty string
    if (!Boolean(doc.first_name) || typeof doc.first_name != "string") {
        requirements.push("first_name");
        compliant = false;
    }

    // last_name must be non empty string
    if (!Boolean(doc.last_name) || typeof doc.last_name != "string") {
         requirements.push("last_name");
         compliant = false;
    }
    
    // id must be non empty string
    if (!Boolean(doc.id) || typeof doc.id != "string") {
        requirements.push("id");
        compliant = false;
        hasValidId = false;
    } 

    // tax_id must be valid numeric string in SSN format with either dashes or spaces between each section, or a nine digit string
    var tax_id_regex = /^(?!(000|666|9))\d{3}-(?!00)\d{2}-(?!0000)\d{4}$|^(?!(000|666|9))\d{3}(?!00)\d{2}(?!0000)\d{4}$|^(?!(000|666|9))\d{3} (?!00)\d{2} (?!0000)\d{4}$/;
    if (!Boolean(doc.tax_id) || typeof doc.tax_id != "string" || !tax_id_regex.test(doc.tax_id) ){
        requirements.push("tax_id");
        compliant = false;
    }

    // see if we even have an address object
    if (!Boolean(doc.address)) {
        requirements.push("address.street");
        requirements.push("address.city");
        requirements.push("address.postal_code");
        requirements.push("address.country");
    } else {
        // address.street must be non empty string
        if (!Boolean(doc.address.street) || typeof doc.address.street != "string") {
            requirements.push("address.street");
            compliant = false;
        }
        
        // address.city must be non empty string
        if (!Boolean(doc.address.city) || typeof doc.address.city != "string") {
            requirements.push("address.city");
            compliant = false;
        }
        
        // address.country must be one of US, GB, CA, AT
        // address.sate must be non empty string if address.county is US or CA; otherwise must be absent
        if (!Boolean(doc.address.country)) {
                requirements.push("address.country");
                compliant = false;
            } else {
                var countries_allowed = ['US', 'GB', 'CA', 'AT'];
                var countries_require_state =['US', 'CA'];
                var state_required;
                var state_not_allowed;
                if (countries_allowed.indexOf(doc.address.country) == -1) {
                    requirements.push("address.country");
                    compliant = false;
                } else {
                    state_required = (countries_require_state.indexOf(doc.address.country) > -1);
    
                    // makes the second if block below more readable
                    state_not_allowed = !state_required;
                    
                    if (!Boolean(doc.address.state) && state_required) {
                        requirements.push("address.state");
                        compliant = false;
                    }
                    if (Boolean(doc.address.state) && state_not_allowed) {
                        requirements.push("address.state");
                        compliant = false;   
                    }
                }
        }
        
        // address.postal_code must be non empty string, and be 5 to 10 alphanumeric characters
        var postal_code_regex = /^[a-zA-Z0-9 ]{5,10}$/;
        if (!Boolean(doc.address.postal_code) || typeof doc.address.postal_code != "string" || !postal_code_regex.test(doc.address.postal_code)) {
            requirements.push("address.postal_code");
            compliant = false;
        }
        
    }

    if (!compliant) {
        httpStatusCode = "400";
        httpStatusReasonPhrase = "Document is not compliant";
    } 
}




function setVars() {
    context.setVariable("docs.response.body", JSON.stringify(response));
    context.setVariable("docs.response.statusCode", httpStatusCode);
    context.setVariable("docs.response.reasonPhrase", httpStatusReasonPhrase);
    if (compliant) {
        context.setVariable("docs.deleteDocState", true);
    } else if (hasValidId) {
        context.setVariable("docs.newDocState", JSON.stringify(newDocState));
        context.setVariable("docs.saveDocState", true);
        context.setVariable("docs.docStateId", docStateId);
    }
}


