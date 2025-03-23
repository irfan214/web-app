// main.controller.js
angular.module('voiceControlApp')
  .controller('MainController', function($scope, VoiceService, CommandHandlerService) {
    // Voice recognition status
    $scope.voiceRecognition = {
      isListening: false,
      transcript: '',
      interimTranscript: '',
      errorMessage: '',
      supportedBrowser: VoiceService.isSupported
    };
    
    // UI feedback for users
    $scope.uiFeedback = {
      message: 'Click the microphone or say "Hey Assistant" to start',
      status: 'idle', // idle, listening, processing, success, error
      lastCommand: '',
      commandRecognized: false
    };
    
    // Initialize app
    function init() {
      if (!$scope.voiceRecognition.supportedBrowser) {
        $scope.uiFeedback.message = 'Voice recognition is not supported in your browser';
        $scope.uiFeedback.status = 'error';
      }
    }
    
    // Toggle voice recognition
    $scope.toggleVoiceRecognition = function() {
      VoiceService.toggleListening();
    };
    
    // Voice status change handler
    $scope.$on('voice:statusChange', function(event, data) {
      $scope.voiceRecognition.isListening = data.isListening;
      
      if (data.isListening) {
        $scope.uiFeedback.message = 'Listening...';
        $scope.uiFeedback.status = 'listening';
      } else {
        $scope.uiFeedback.message = 'Click the microphone or say "Hey Assistant" to start';
        $scope.uiFeedback.status = 'idle';
      }
    });
    
    // Voice update handler
    $scope.$on('voice:update', function(event, data) {
      $scope.voiceRecognition.transcript = data.transcript;
      $scope.voiceRecognition.interimTranscript = data.interimTranscript;
    });
    
    // Voice command handler
    $scope.$on('voice:command', function(event, data) {
      $scope.uiFeedback.lastCommand = data.command;
      $scope.uiFeedback.status = 'processing';
      $scope.uiFeedback.message = 'Processing: "' + data.command + '"';
      
      // Process command
      var recognized = CommandHandlerService.processCommand(data.command);
      $scope.uiFeedback.commandRecognized = recognized;
      
      if (recognized) {
        $scope.uiFeedback.status = 'success';
        $scope.uiFeedback.message = 'Command recognized: "' + data.command + '"';
      } else {
        $scope.uiFeedback.status = 'error';
        $scope.uiFeedback.message = 'Unrecognized command: "' + data.command + '"';
      }
    });
    
    // Voice error handler
    $scope.$on('voice:error', function(event, data) {
      $scope.voiceRecognition.errorMessage = 'Error: ' + data.error;
      $scope.uiFeedback.status = 'error';
      $scope.uiFeedback.message = 'Voice recognition error: ' + data.error;
    });
    
    // Initialize
    init();
  });
