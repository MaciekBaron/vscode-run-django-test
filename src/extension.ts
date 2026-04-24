import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "django-test-runner.runCurrentTest",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {return;}

      const document = editor.document;
      const cursorLine = editor.selection.active.line;

      const relativePath = vscode.workspace.asRelativePath(document.uri);
      const dotPath = pathToDotPath(relativePath);

      const symbols = await vscode.commands.executeCommand<
        vscode.DocumentSymbol[]
      >("vscode.executeDocumentSymbolProvider", document.uri);

      const symbolName = symbols ? findSymbolAtLine(symbols, cursorLine) : null;
      const testTarget = symbolName ? `${dotPath}.${symbolName}` : dotPath;

      const terminalName = "Django Test Runner";
      const terminal =
        vscode.window.terminals.find((t) => t.name === terminalName) ||
        vscode.window.createTerminal(terminalName);
      const template = vscode.workspace
        .getConfiguration("django-test-runner")
        .get<string>("testCommand", "");
      const command = buildCommand(template, testTarget);

      terminal.show();
      terminal.sendText(command);
    },
  );

  context.subscriptions.push(disposable);
}

export function pathToDotPath(relativePath: string): string {
  return relativePath.replace(/\.py$/, "").replace(/[/\\]/g, ".");
}

export function buildCommand(template: string, testTarget: string): string {
  return template.replace(/\$\{testTarget\}/g, testTarget);
}

export function findSymbolAtLine(
  symbols: vscode.DocumentSymbol[],
  line: number,
): string | null {
  for (const symbol of symbols) {
    if (line >= symbol.range.start.line && line <= symbol.range.end.line) {
      const childName = findSymbolAtLine(symbol.children, line);
      return childName ? `${symbol.name}.${childName}` : symbol.name;
    }
  }
  return null;
}

export function deactivate() {}
