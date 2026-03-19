"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
function activate(context) {
    console.log('Axon is now active');
    // Register the start command
    const startCommand = vscode.commands.registerCommand('axon.start', () => {
        vscode.window.showInformationMessage('Axon is running!');
    });
    // Register the route scanner
    const routeScanner = new RouteScanner();
    context.subscriptions.push(startCommand);
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(() => {
        routeScanner.scan();
    }));
}
class RouteScanner {
    scan() {
        const files = vscode.workspace.textDocuments;
        files.forEach(file => {
            const text = file.getText();
            const routes = this.extractRoutes(text);
            if (routes.length > 0) {
                console.log(`Found ${routes.length} routes in ${file.fileName}`);
            }
        });
    }
    extractRoutes(text) {
        const routes = [];
        // Detect Express routes
        const expressPattern = /\.(get|post|put|delete|patch)\(['"`](.*?)['"`]/g;
        let match;
        while ((match = expressPattern.exec(text)) !== null) {
            routes.push(`${match[1].toUpperCase()} ${match[2]}`);
        }
        return routes;
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map