## Django test runner extension for Visual Studio Code

This is an extension for Visual Studio Code that makes it easier to run tests in Django projects which don't use pytest.

It simply runs `poetry run ./manage.py test` pointing at the object under the cursor.

The actual command is configurable, so you could potentially use it for something else.

You will most likely not need this extension if you are using pytest, as the [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python) already has good support for pytest.

Also see [Python testing in Visual Studio Code](https://code.visualstudio.com/docs/python/testing) for more information on testing in Python projects in general.
