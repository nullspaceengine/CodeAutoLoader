(function( module, assert, undefined ) {
  var moduleAutoLoader = (function() {
    // private members
    var node = {
      "path" : require('path'),
      "fs" : require("fs")
    };
    // The path to the root of the project
    // TODO make this progromatic and configurable
    var rootPath = node.path.join(node.fs.realpathSync(__filename).toString(), "../../../..");
    var systemPath = node.path.join(rootPath, "system");
    var libPath = node.path.join(rootPath, "lib");
    var modulePath = node.path.join(rootPath, "node_modules");
    // Using a regular expression to test if the file is a package.json file.
    var packagePattern = /package\.json$/;
    // Storehouse object for the system/app modules, libs, and others.
    var module_registry = { "system": [], "module": [], "lib":[], 'root': [] };
    // Storehouse for the objects returned from require().
    var modules = [];
    // Keep the state of the module registration and load system.
    var state = undefined;

    // private methods
    var detectModules = function(flag, path) {
      if(typeof path !== 'undefined' && flag == "custom") {
        node.fs.exists(path, function(exists) {
          if(exists) {
            // if the flag is custom and the path is defined
            // and the path exists then do the thing
            path = path;
          }
          else {
            // if the flag is custom and the path is defined
            // and the path doesn't exist then something is probably
            // wrong and we should just stop here.
            // TODO make this error message meaningful.
            throw new Error("Path doesn't exist");
          }
        });
      }
      else {
        switch (flag) {
          case "root":
            path = rootPath;
            state = 'root';
            break;
          case "system":
            path = systemPath;
            state = 'system';
            break;
          case "lib":
            path = libPath;
            state = 'lib';
            break;
          case "module":
            path = modulePath;
            state = 'module';
            break;
        }
      }

      if(node.fs.lstatSync(path).isDirectory()) {
        // we have a directory: do a tree walk
        var files = node.fs.readdirSync(path);
          var file_path, l = files.length;
          for (var i = 0; i < l; i++) {
            file_path = node.path.join(path, files[i]);
            if(packagePattern.exec(file_path)) {
              registerModule('module', file_path, 'package');
            }
            detectModules("custom", file_path);
          }

      }
    };

    var registerModule = function(type, module_path, flag) {
      if(flag == "package") {
        module_path = node.path.join(module_path, "../");
      }
      module_registry[type].push(module_path);
    };

    var loadModules = function(flag) {
      if(module_registry.hasOwnProperty(flag)) {
        for(var i in module_registry[flag]) {
          loadModule(module_registry[flag][i].toString());
        }
      }
    };

    var loadModule = function(module) {
      console.log(module);
      modules.push(require(module));
    };

    // private constructor
    var construct = function(param) {
      this.publicMember = param;

      // public members go here
      this.processGlobal = function(global) {
        global.somerandomvalue = this.privateMember;
        for(var i = 0; i < modules.length; i ++) {
          global.push(modules[i]);
        }
      };

      this.getModuleRegistry = function() {
        return module_registry;
      };

      // Run initialization
      console.log("loaded module auto loader");
      //detect and register libs, and modules.
      detectModules("module");

      console.log(module_registry);

      // load the libs, and modules.
      loadModules("module");

      // Run tests
      assert(module_registry.module.length >= 1, "modules are being registered");
    };
    return construct;
  })();

  module.exports = moduleAutoLoader;

})(module, global.assert);
