const recast = require('recast');

// eslint-disable-next-line no-unused-vars
module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    dependencies: {
      'auth0-js': '^9.8.2',
    },
  });

  api.injectImports('src/router/index.js', 'import auth from \'../auth\'');
  api.injectImports('src/router/index.js', 'import AuthCallback from \'../components/AuthCallback.vue\'');
  api.injectImports('src/router/index.js', 'import AuthForbidden from \'../components/AuthForbidden.vue\'');

  // TODO: Until router plugin is separated
  rootOptions.router = false;

  api.render('./template/auth0');

  api.postProcessFiles((files) => {
    const ast = recast.parse(files['src/router/index.js']);

    const callbackExp = '({\n  path: \'/callback\',\n  name: \'AuthCallback\',\n  component: AuthCallback\n})';
    const forbiddenExp = '({\n  path: \'/forbidden\',\n  name: \'AuthForbidden\',\n  component: AuthForbidden\n})';

    const guard = `// Set meta.auth true to guard a route with authentication
    router.beforeEach((to, from, next) => {
      if (to.matched.some(record => record.meta.auth)) {
        if (!auth.isLoggedIn()) {
          return next({
            name: 'AuthForbidden',
            query: {
              redirect: to.fullPath
            }
          })
        }
      }

      return next()
    })`;

    const historyLit = '\'history\'';
    const historyProps = `({\n  mode: ${historyLit},\n base: process.env.BASE_URL\n})`;

    const callbackExpObj = recast.parse(callbackExp).program.body[0].expression;
    const forbiddenExpObj = recast.parse(forbiddenExp).program.body[0].expression;
    const guardObj = recast.parse(guard).program.body[0];
    const historyLitObj = recast.parse(historyLit).program.body[0].expression;
    const historyPropsObj = recast.parse(historyProps).program.body[0].expression.properties;

    let insertedRoutes = false;
    let guardPresent = false;

    recast.types.visit(ast, {
      visitCallExpression({ node }) {
        const c = node.callee;

        if (c.type === 'MemberExpression' && c.object.type === 'Identifier' && c.object.name === 'router' && c.property.type === 'Identifier' && c.property.name === 'beforeEach' && node.arguments.length) {
          const a = node.arguments[0];

          if (a.type === 'ArrowFunctionExpression' && a.body.type === 'BlockStatement' && a.body.body.length && a.body.body[0].type === 'IfStatement') {
            const i = a.body.body[0];

            if (i.test.type === 'CallExpression' && i.test.arguments.length && i.test.arguments[0].type === 'ArrowFunctionExpression' && i.test.arguments[0].body.type === 'MemberExpression') {
              const p = i.test.arguments[0].params;
              const b = i.test.arguments[0].body;

              if (p.length && p[0].type === 'Identifier' && p[0].name === 'record' && b.object.type === 'MemberExpression' && b.object.object.type === 'Identifier' && b.object.object.name === 'record'
                && b.object.property.type === 'Identifier' && b.object.property.name === 'meta' && b.property.type === 'Identifier' && b.property.name === 'auth') {
                guardPresent = true;
              }
            }
          }
        }

        return false;
      },

      visitVariableDeclarator({ node }) {
        // Add history mode
        if (node.init.type === 'NewExpression' && node.init.callee.name === 'VueRouter') {
          const opts = node.init.arguments[0];

          if (opts && opts.type === 'ObjectExpression') {
            const modeIndex = opts.properties.findIndex((p) => p.key.name === 'mode');
            const baseIndex = opts.properties.findIndex((p) => p.key.name === 'base');

            if (modeIndex !== -1) {
              opts.properties[modeIndex].value = historyLitObj;
            }

            if (baseIndex === -1) {
              opts.properties.unshift(historyPropsObj[1]);
            }

            if (modeIndex === -1) {
              opts.properties.unshift(historyPropsObj[0]);
            }
          }
        }

        // Add routes
        if (node.id.name === 'routes' && node.init.type === 'ArrayExpression') {
          insertedRoutes = true;
          let callbackExists = false;
          let forbiddenExists = false;

          node.init.elements.forEach((e) => {
            e.properties.forEach((p) => {
              if (p.key.name === 'path' && p.value.type === 'Literal' && p.value.value === '/callback') {
                callbackExists = true;
              }

              if (p.key.name === 'path' && p.value.type === 'Literal' && p.value.value === '/forbidden') {
                forbiddenExists = true;
              }
            });
          });

          if (!callbackExists) {
            node.init.elements.push(callbackExpObj);
          }

          if (!forbiddenExists) {
            node.init.elements.push(forbiddenExpObj);
          }
        }

        return false;
      },
    });

    // Add navigational guard
    if (!guardPresent) {
      const exportStmt = ast.program.body.slice(-1)[0];

      if (exportStmt.type === 'ExportDefaultDeclaration' && exportStmt.declaration.name === 'router') {
        ast.program.body.splice(-1, 0, guardObj);
      }
    }

    if (!insertedRoutes) {
      // eslint-disable-next-line no-console
      console.warn('Unable to find `routes` array');
    }

    // eslint-disable-next-line no-param-reassign
    files['src/router/index.js'] = recast.print(ast).code;
  });
};
