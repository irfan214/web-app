// app.js
angular.module('voiceControlApp', ['ngRoute']);

// routes.js
angular.module('voiceControlApp')
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
      })
      .when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardController'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsController'
      })
      .when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileController'
      })
      .when('/help', {
        templateUrl: 'views/help.html',
        controller: 'HelpController'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

// home.controller.js
angular.module('voiceControlApp')
  .controller('HomeController', function($scope) {
    $scope.title = 'Home';
    $scope.message = 'Welcome to the Voice-Controlled Web App';
    
    // Listen for specific commands
    $scope.$on('command:search', function(event, data) {
      $scope.searchQuery = data.searchTerm;
    });
  });

// dashboard.controller.js
angular.module('voiceControlApp')
  .controller('DashboardController', function($scope, $http) {
    $scope.title = 'Dashboard';
    $scope.items = [];
    $scope.loading = true;
    
    // Load items from API
    function loadItems() {
      $scope.loading = true;
      $http.get('/api/items')
        .then(function(response) {
          $scope.items = response.data;
          $scope.loading = false;
        })
        .catch(function(error) {
          console.error('Error loading items:', error);
          $scope.loading = false;
        });
    }
    
    // Listen for item creation
    $scope.$on('item:created', function(event, data) {
      $scope.items.push(data.item);
    });
    
    // Listen for item deletion
    $scope.$on('item:deleted', function(event, data) {
      // Reload items after deletion
      loadItems();
    });
    
    // Initialize
    loadItems();
  });

// settings.controller.js
angular.module('voiceControlApp')
  .controller('SettingsController', function($scope) {
    $scope.title = 'Settings';
    $scope.settings = {
      voiceActivation: true,
      continousListening: true,
      language: 'en-US',
      darkMode: false
    };
    
    $scope.saveSettings = function() {
      // In a real app, you would save these to the server or localStorage
      console.log('Settings saved:', $scope.settings);
    };
  });

// help.controller.js
angular.module('voiceControlApp')
  .controller('HelpController', function($scope) {
    $scope.title = 'Help & Commands';
    $scope.commandSections = [
      {
        title: 'Navigation Commands',
        commands: [
          { phrase: 'Go to home', description: 'Navigate to the home page' },
          { phrase: 'Navigate to dashboard', description: 'Open the dashboard view' },
          { phrase: 'Open settings', description: 'Go to the settings page' },
          { phrase: 'Show profile', description: 'View your profile page' },
          { phrase: 'Go to help', description: 'Open this help page' }
        ]
      },
      {
        title: 'Action Commands',
        commands: [
          { phrase: 'Search for [term]', description: 'Search content with the specified term' },
          { phrase: 'Create note [content]', description: 'Create a new note' },
          { phrase: 'Add task [description]', description: 'Add a new task' },
          { phrase: 'Delete item [description]', description: 'Remove an item by description' },
          { phrase: 'Log out', description: 'Sign out of the application' }
        ]
      }
    ];
  });
