// voice.service.js
angular.module('voiceControlApp')
  .factory('VoiceService', function($rootScope) {
    var service = {};
    
    // Check for browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return {
        isSupported: false,
        startListening: function() { console.warn('Speech recognition not supported'); },
        stopListening: function() { console.warn('Speech recognition not supported'); }
      };
    }
    
    // Initialize speech recognition
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    var recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Recognition state
    service.isListening = false;
    service.isSupported = true;
    service.transcript = '';
    service.interimTranscript = '';
    
    // Handle recognition results
    recognition.onresult = function(event) {
      service.interimTranscript = '';
      service.transcript = '';
      
      for (var i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          service.transcript += event.results[i][0].transcript;
        } else {
          service.interimTranscript += event.results[i][0].transcript;
        }
      }
      
      // Broadcast transcript updates to controllers
      $rootScope.$broadcast('voice:update', {
        transcript: service.transcript,
        interimTranscript: service.interimTranscript
      });
      
      // Process commands if final results are available
      if (service.transcript) {
        processVoiceCommand(service.transcript);
      }
      
      // Apply scope changes
      $rootScope.$apply();
    };
    
    // Process voice commands
    function processVoiceCommand(transcript) {
      var command = transcript.trim().toLowerCase();
      
      // Broadcast the command for controllers to handle
      $rootScope.$broadcast('voice:command', { command: command });
      
      // Log recognized command
      console.log('Voice command recognized:', command);
    }
    
    // Error handling
    recognition.onerror = function(event) {
      console.error('Speech recognition error', event.error);
      $rootScope.$broadcast('voice:error', { error: event.error });
      $rootScope.$apply();
    };
    
    // Start listening for voice input
    service.startListening = function() {
      if (service.isListening) return;
      
      recognition.start();
      service.isListening = true;
      $rootScope.$broadcast('voice:statusChange', { isListening: true });
    };
    
    // Stop listening for voice input
    service.stopListening = function() {
      if (!service.isListening) return;
      
      recognition.stop();
      service.isListening = false;
      $rootScope.$broadcast('voice:statusChange', { isListening: false });
    };
    
    // Toggle listening state
    service.toggleListening = function() {
      if (service.isListening) {
        service.stopListening();
      } else {
        service.startListening();
      }
    };
    
    return service;
  });
