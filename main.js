'use strict'

// ***** Constants *****
const millisecondsInSeconds = 1000;

// ***** Element references *****
var delaySlider = document.getElementById("delaySlider");
var delaySelectedOutput = document.getElementById("delaySelectedOutput");
var intervalSlider = document.getElementById("intervalSlider");
var intervalSelectedOutput = document.getElementById("intervalSelectedOutput");
var nextRequest = document.getElementById("nextRequest");
var forceError = document.getElementById("serverErrors");
var historyRows = document.getElementById("historyRows");
var submitButton = document.getElementById("submitButton");
var stopIntervalButton = document.getElementById("stopIntervalButton");
var activeIntervalContainer = document.getElementById("activeIntervalContainer");
var requestInterval = null;

// ***** Delay slider *****
// Display the default slider value
delaySelectedOutput.innerHTML = delaySlider.value;

// Update the current delay slider value when slider is adjusted
delaySlider.oninput = function() {
    delaySelectedOutput.innerHTML = this.value;
}

// ***** Interval slider *****
// Display the default slider value
intervalSelectedOutput.innerHTML = intervalSlider.value; 

// Update the current interval slider value when slider is adjusted
intervalSlider.oninput = function() {
    // console.log(this.value)
    intervalSelectedOutput.innerHTML = this.value;
}

// ***** Requests *****
// requestItem defines properties and methods for the request and response logging
var requestItem = function(delay, error, interval, sent) {
    this.delay = delay;
    this.forceError = error;
    this.interval = interval;
    this.sent = sent;
    this.received = 0;
    this.message = "";
    this.statusCode = 0;
    this.tripTime = function(){
        return (this.received - this.sent)/1000
    }
    this.time = function(d){
        return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    }

    this.html = function(){
        console.log(this.statusCode)
        let statusBarClass = "statusBarSuccess";
        if (this.statusCode !== 200 && this.statusCode !== 201 && this.statusCode !== 202) {
            statusBarClass = "statusBarError"
        } else if (this.tripTime() > 2) {
            statusBarClass = "statusBarSlow"
        }
        console.log(statusBarClass)
        return `
            <div class="historyRow">
                <div class="statusBar ${statusBarClass}"></div>
                <div class="sentOnColumn">${this.time(this.sent)}</div>
                <div class="receivedOnColumn">${this.time(this.received)}</div>
                <div class="delayedColumn">${this.delay}s</div>
                <div class="tripTimeColumn">${this.tripTime()}s</div>
                <div class="withErrorsColumn">${this.forceError}</div>
                <div class="messageColumn">${this.message}</div>
            </div>
        `;
    }
}

// Submit a request
submitButton.onclick = function() {
    if (intervalSlider.value > 0) {
        console.log("requestInterval: " + intervalSlider.value);
        submitButton.style.display = 'none';
        stopIntervalButton.style.display = 'block';
        intervalSlider.disabled = true;
        forceError.disabled = true;
        newRequest();
        requestInterval = setInterval(newRequest, intervalSlider.value * millisecondsInSeconds);
    } else {
        newRequest();
    }
}

// stop the interval of requests
stopIntervalButton.onclick = function() {
    console.log("stop interval");
    stopInterval();
}

function random(min, max) {  
    return Math.random() * (max - min) + min;
}

function randomError() {
    let errors = ["none", "badRequest", "internalServer", "unauthorized"];
    return errors[Math.floor(random(0, errors.length))];
}

function newRequest() {
    let forceErr
    if (forceError.value === "random") {
        forceErr = randomError()
    } else {
        forceErr = forceError.value
    }
    let r = new requestItem(parseInt(delaySlider.value), forceErr, intervalSlider.value, new Date());
    send(r);
}

function stopInterval() {
    console.log("requestInterval");
    clearInterval(requestInterval);
    stopIntervalButton.style.display = 'none';
    submitButton.style.display = 'block';
    intervalSlider.disabled = false;
    forceError.disabled = false;
}

function send(r) {
    let xhr = new XMLHttpRequest();
    let url = "/time";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            r.statusCode = xhr.status;
            r.received = new Date();
            r.message = this.responseText;
            historyRows.innerHTML = r.html() + historyRows.innerHTML;
        } 
    }; 
    var data = JSON.stringify(r);
    console.log(data)
    xhr.send(data);
}
