require.config({
   shim: {
      'jQuery': {exports: 'jQuery'}
   },
   paths: {
      jquery: 'ext/jquery-2.0.3.min'
   },
   deps: [
      'app'
   ]
});
