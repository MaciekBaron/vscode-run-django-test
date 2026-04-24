/// <reference types="mocha" />
import * as assert from "assert";
import * as vscode from "vscode";
import {
  buildCommand,
  findSymbolAtLine,
  pathToDotPath,
} from "../extension";

suite("pathToDotPath", () => {
  test("converts a nested POSIX path", () => {
    assert.strictEqual(
      pathToDotPath("cms/tests/test_logic.py"),
      "cms.tests.test_logic",
    );
  });

  test("converts a Windows-style path", () => {
    assert.strictEqual(
      pathToDotPath("cms\\tests\\test_logic.py"),
      "cms.tests.test_logic",
    );
  });

  test("handles a top-level module", () => {
    assert.strictEqual(pathToDotPath("manage.py"), "manage");
  });

  test("only strips a trailing .py, not a leading dot", () => {
    assert.strictEqual(
      pathToDotPath("cms/tests/test.py.helpers.py"),
      "cms.tests.test.py.helpers",
    );
  });
});

suite("buildCommand", () => {
  test("substitutes a single placeholder", () => {
    assert.strictEqual(
      buildCommand("pytest ${testTarget}", "cms.tests.test_logic"),
      "pytest cms.tests.test_logic",
    );
  });

  test("substitutes repeated placeholders", () => {
    assert.strictEqual(
      buildCommand("echo ${testTarget} && run ${testTarget}", "a.b"),
      "echo a.b && run a.b",
    );
  });

  test("returns the template unchanged when no placeholder is present", () => {
    assert.strictEqual(
      buildCommand("poetry run pytest", "cms.tests.test_logic"),
      "poetry run pytest",
    );
  });

  test("returns an empty string for an empty template", () => {
    assert.strictEqual(buildCommand("", "cms.tests.test_logic"), "");
  });
});

suite("findSymbolAtLine", () => {
  const makeSymbol = (
    name: string,
    startLine: number,
    endLine: number,
    children: vscode.DocumentSymbol[] = [],
  ): vscode.DocumentSymbol => {
    const range = new vscode.Range(startLine, 0, endLine, 0);
    const symbol = new vscode.DocumentSymbol(
      name,
      "",
      vscode.SymbolKind.Class,
      range,
      range,
    );
    symbol.children = children;
    return symbol;
  };

  test("returns null when the line is outside every symbol", () => {
    const symbols = [makeSymbol("TestFoo", 10, 20)];
    assert.strictEqual(findSymbolAtLine(symbols, 5), null);
  });

  test("returns the class name when the cursor is on the class line", () => {
    const symbols = [
      makeSymbol("TestFoo", 10, 30, [makeSymbol("test_bar", 12, 20)]),
    ];
    assert.strictEqual(findSymbolAtLine(symbols, 10), "TestFoo");
  });

  test("returns Class.method when the cursor is inside a method", () => {
    const symbols = [
      makeSymbol("TestFoo", 10, 30, [makeSymbol("test_bar", 12, 20)]),
    ];
    assert.strictEqual(findSymbolAtLine(symbols, 15), "TestFoo.test_bar");
  });

  test("walks arbitrarily deep nesting", () => {
    const symbols = [
      makeSymbol("Outer", 0, 100, [
        makeSymbol("Inner", 10, 50, [makeSymbol("deepest", 20, 30)]),
      ]),
    ];
    assert.strictEqual(
      findSymbolAtLine(symbols, 25),
      "Outer.Inner.deepest",
    );
  });
});
