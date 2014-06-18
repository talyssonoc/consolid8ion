module.exports = {
  ejs: {
    extension: 'ejs',
    lib: function() { return require('ejs'); }
  },
  
  handlebars: {
    extension: 'hbs',
    lib: function() { return require('handlebars'); }
  },

  swig: {
    extension: 'swig',
    lib: function() { return require('swig'); }
  },

  eco: {
    extension: 'eco',
    lib: function() { return require('eco'); }
  },

  haml: {
    extension: 'haml',
    lib: function() { return require('hamljs'); }
  },
  
  'haml-coffee': {
    extension: 'hamlc',
    lib: function() { return require('haml-coffee'); }
  },

  hogan: {
    extension: 'hogan',
    lib: function() { return require('hogan.js'); }
  },

  mustache: {
    extension: 'mustache',
    lib: function() { return require('mustache'); }
  },

  dust: {
    extension: 'dust',
    lib: function() { return require('dustjs-linkedin'); }
  },

  jade: {
    extension: 'jade',
    lib: function() { return require('jade'); }
  },
  
  nunjucks: {
      extension: 'nun',
      lib: function() { return require('nunjucks'); }
  },

  jazz: {
      extension: 'jazz',
      lib: function() { return require('jazz'); }
  },
  
  ect: {
      extension: 'ect',
      lib: function() { return new require('ect')(); }
  },

  qejs: {
      extension: 'qejs',
      lib: function() { return require('qejs'); }
  }
};