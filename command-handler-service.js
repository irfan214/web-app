// command-handler.service.js
angular.module('voiceControlApp')
  .factory('CommandHandlerService', function($location, $http, $rootScope) {
    var service = {};
    
    // Command patterns with regular expressions
    var commandPatterns = [
      {
        pattern: /^(go to|navigate to|open|show) (home|dashboard|settings|profile|help)$/i,
        handler: handleNavigation
      },
      {
        pattern: /^search for (.+)$/i,
        handler: handleSearch
      },
      {
        pattern: /^(create|add|new) (item|note|task|reminder)(?:\s+(.+))?$/i,
        handler: handleCreate
      },
      {
        pattern: /^(delete|remove) (item|note|task|reminder)(?:\s+(.+))?$/i,
        handler: handleDelete
      },
      {
        pattern: /^(log out|sign out|logout)$/i,
        handler: handleLogout
      }
    ];
    
    // Process incoming commands
    service.processCommand = function(command) {
      var matched = false;
      
      // Check command against patterns
      commandPatterns.forEach(function(commandPattern) {
        var match = command.match(commandPattern.pattern);
        if (match) {
          commandPattern.handler(match);
          matched = true;
        }
      });
      
      // If no pattern matched
      if (!matched) {
        $rootScope.$broadcast('command:unrecognized', { command: command });
      }
      
      return matched;
    };
    
    // Navigation command handler
    function handleNavigation(match) {
      var destination = match[2].toLowerCase();
      var path;
      
      switch (destination) {
        case 'home':
          path = '/';
          break;
        case 'dashboard':
          path = '/dashboard';
          break;
        case 'settings':
          path = '/settings';
          break;
        case 'profile':
          path = '/profile';
          break;
        case 'help':
          path = '/help';
          break;
        default:
          path = '/';
      }
      
      $location.path(path);
      $rootScope.$broadcast('command:navigation', { 
        destination: destination, 
        path: path 
      });
    }
    
    // Search command handler
    function handleSearch(match) {
      var searchTerm = match[1];
      
      // Broadcast search event
      $rootScope.$broadcast('command:search', { searchTerm: searchTerm });
      
      // Example: API call to search endpoint
      $http.get('/api/search', { params: { q: searchTerm } })
        .then(function(response) {
          $rootScope.$broadcast('search:results', { 
            results: response.data,
            searchTerm: searchTerm
          });
        })
        .catch(function(error) {
          console.error('Search error:', error);
        });
    }
    
    // Create command handler
    function handleCreate(match) {
      var itemType = match[2];
      var itemDetails = match[3] || '';
      
      $rootScope.$broadcast('command:create', { 
        itemType: itemType,
        itemDetails: itemDetails
      });
      
      // Example: API call to create item
      $http.post('/api/items', {
        type: itemType,
        details: itemDetails,
        createdAt: new Date()
      })
      .then(function(response) {
        $rootScope.$broadcast('item:created', { 
          item: response.data
        });
      })
      .catch(function(error) {
        console.error('Create error:', error);
      });
    }
    
    // Delete command handler
    function handleDelete(match) {
      var itemType = match[2];
      var itemDetails = match[3] || '';
      
      $rootScope.$broadcast('command:delete', { 
        itemType: itemType,
        itemDetails: itemDetails
      });
      
      // In a real app, you would first identify the specific item to delete
      // This is a simplified example
      $http.delete('/api/items', { params: { query: itemDetails } })
        .then(function(response) {
          $rootScope.$broadcast('item:deleted', { 
            result: response.data
          });
        })
        .catch(function(error) {
          console.error('Delete error:', error);
        });
    }
    
    // Logout command handler
    function handleLogout() {
      $rootScope.$broadcast('command:logout');
      
      // Perform logout API call
      $http.post('/api/auth/logout')
        .then(function() {
          // Redirect to login page
          $location.path('/login');
        })
        .catch(function(error) {
          console.error('Logout error:', error);
        });
    }
    
    return service;
  });
