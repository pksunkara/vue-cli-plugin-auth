const prettier = require('prettier');

module.exports = (api, options, rootOptions) => {
  // TODO: Typescript support
  // TODO: Support @vue/cli-plugin-router
  // TODO: Post process lint

  if (!api.hasPlugin('route')) {
    // eslint-disable-next-line no-console
    console.warn('\nERROR: Unable to find router.\n\nPlease install `vue-cli-plugin-route` before this plugin.');
    return;
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(`./${options.type}`)(api, options, rootOptions);

  api.postProcessFiles((files) => {
    // eslint-disable-next-line no-param-reassign
    files['src/router/index.js'] = prettier.format(files['src/router/index.js'], {
      semi: false,
      singleQuote: true,
      parser: 'babel',
    });
  });
};
