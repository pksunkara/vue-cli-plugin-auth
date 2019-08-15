module.exports = [
  {
    name: 'type',
    type: 'list',
    message: 'Which authentication do you want?',
    choices: [
      {
        name: 'Auth0',
        value: 'auth0',
      },
    ],
  },
  {
    when: (answers) => answers.type === 'auth0',
    name: 'subdomain',
    type: 'input',
    message: 'Subdomain of auth0?',
    validate: (input) => (input !== '' ? true : 'Subdomain is required.'),
  },
  {
    when: (answers) => answers.type === 'auth0',
    name: 'clientID',
    type: 'input',
    message: 'ClientID for auth0?',
    validate: (input) => (input !== '' ? true : 'ClientID is required.'),
  },
];
