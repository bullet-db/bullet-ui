# How to contribute
First, thanks for taking the time to contribute to our project! The following information provides a guide for making contributions.

## Code of Conduct

By participating in this project, you agree to abide by the [Yahoo Code of Conduct](Code-of-Conduct.md). Everyone is welcome to submit a pull request or open an issue to improve the documentation, add improvements, or report bugs.

## How to Ask a Question

If you simply have a question that needs an answer, [create an issue](https://help.github.com/articles/creating-an-issue/), and label it as a question.

## How To Contribute

### Report a Bug or Request a Feature

If you encounter any bugs while using this software, or want to request a new feature or enhancement, feel free to [create an issue](https://help.github.com/articles/creating-an-issue/) to report it, make sure you add a label to indicate what type of issue it is.

### Contribute Code
Pull requests are welcome for bug fixes. If you want to implement something new, please [request a feature first](#report-a-bug-or-request-a-feature) so we can discuss it.

#### Creating a Pull Request
Before you submit any code, we need you to agree to our [Contributor License Agreement](https://yahoocla.herokuapp.com/); this ensures we can continue to protect your contributions under an open source license well into the future.

Please follow [best practices](https://github.com/trein/dev-best-practices/wiki/Git-Commit-Best-Practices) for creating git commits.

When your code is ready to be submitted, you can [submit a pull request](https://help.github.com/articles/creating-a-pull-request/) to begin the code review process.

#### Prerequisites

You will need the following things properly installed on your computer. You will also obviously need an actual Bullet web-service endpoint or a mock for your UI to work.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM. Highly recommend using NVM to manage Node and NOT install node globally)
* [Yarn](https://yarnpkg.com)
* [Ember CLI](http://www.ember-cli.com/)

#### Installation

* git clone this repository
* change into the new directory
* `yarn`

#### Building

* `ember build` (development)
* `ember build --environment production` (production)

#### Running / Development

* `ember server or ember s`
* Visit your app at [http://localhost:4200](http://localhost:4200).

#### Running Tests

* `ember test`
* `ember test --server`


## Further Reading / Useful Links

* [ember.js](http://emberjs.com/)
* [ember-cli](http://www.ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
