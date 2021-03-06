/*
Copyright (c) 2014, Groupon, Inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright
notice, this list of conditions and the following disclaimer in the
documentation and/or other materials provided with the distribution.

Neither the name of GROUPON nor the names of its contributors may be
used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// Generated by CoffeeScript 2.0.0-beta7
void function () {
  var createSeleniumArguments, path, port, SELENIUM_PORT, SELENIUM_TIMEOUT, spawn, spawnProcess;
  SELENIUM_PORT = 4444;
  SELENIUM_TIMEOUT = 9e4;
  path = require('path');
  spawn = require('./spawn');
  port = require('./port');
  createSeleniumArguments = function () {
    var chromeArgs, chromeDriverPath, firefoxProfilePath;
    chromeDriverPath = path.join(__dirname, '../../../bin/chromedriver');
    chromeArgs = [
      '--disable-application-cache',
      '--media-cache-size=1',
      '--disk-cache-size=1',
      '--disk-cache-dir=/dev/null',
      '--disable-cache',
      '--disable-desktop-notifications'
    ].join(' ');
    firefoxProfilePath = path.join(__dirname, './firefox_profile.js');
    return [
      '-Dwebdriver.chrome.driver=' + chromeDriverPath,
      '-Dwebdriver.chrome.args="' + chromeArgs + '"',
      '-firefoxProfileTemplate',
      firefoxProfilePath,
      '-ensureCleanSession',
      '-debug'
    ];
  };
  spawnProcess = function (logStream, javaHeapSize) {
    var args, jarPath, javaHeapArg;
    jarPath = path.join(__dirname, '../../../bin/selenium.jar');
    javaHeapArg = '-Xmx' + javaHeapSize + 'm';
    args = [
      javaHeapArg,
      '-jar',
      jarPath
    ].concat(createSeleniumArguments());
    return spawn('java', args, 'selenium', logStream);
  };
  module.exports = function (logStream, javaHeapSize) {
    if (null == javaHeapSize)
      javaHeapSize = 256;
    return function (parallelCallback) {
      var callback;
      callback = function (error, process) {
        return parallelCallback(null, {
          error: error,
          process: process
        });
      };
      logStream.log('Starting selenium');
      return port.isAvailable(SELENIUM_PORT, function (error, isAvailable) {
        var seleniumProcess;
        if (null != error)
          return callback(error);
        if (!isAvailable)
          return callback(new Error('Port ' + SELENIUM_PORT + ' (requested by selenium) is already in use.'));
        seleniumProcess = spawnProcess(logStream, javaHeapSize);
        logStream.log('waiting for selenium to listen on port ' + SELENIUM_PORT);
        return port.waitFor(seleniumProcess, SELENIUM_PORT, SELENIUM_TIMEOUT, function (error, timedOut) {
          if (null != error)
            return callback(error);
          if (timedOut)
            return callback(new Error('Timeout occurred waiting for selenium to be ready on port ' + SELENIUM_PORT + '. Check the log at: ' + logStream.path));
          logStream.log('selenium is ready!');
          return callback(null, seleniumProcess);
        });
      });
    };
  };
}.call(this);
