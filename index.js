const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    const [commandName, argument] = command.split(' ');

    switch (commandName) {
        case 'exit':
            process.exit(0);
            break;
        case 'show-todos':
            showTodos();
            break;
        case 'important':
            showImportantTodos();
            break;
        case 'user':
            if (argument) {
                showTodosByUser(argument);
            } else {
                console.log('Not found');
            }
            break;
        case 'sort':
            if (argument === 'importance') {
                const todos = getTodos();
                const sortedTodos = sortByImportance(todos);
                printTodos(sortedTodos);
            } else if (argument === 'user') {
                const todos = getTodos();
                const sortedTodos = sortByUser(todos);
                printTodos(sortedTodos);
            } else if (argument === 'date') {
                const todos = getTodos();
                const sortedTodos = sortByDate(todos);
                printTodos(sortedTodos);
            } else {
                console.log('wrong sort argument');
            }
            break;
        case 'date':
            if (argument) {
                const todos = getTodos();
                const filteredTodos = filterByDate(todos, argument);
                printTodos(filteredTodos);
            } else {
                console.log('Not found');
            }
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function showTodos() {
    const todos = getTodos();
    printTodos(todos);
}

function showImportantTodos() {
    const todos = getTodos();
    const importantTodos = todos.filter(todo => todo.comment.includes('!'));
    printTodos(importantTodos);
}

function showTodosByUser(username) {
    const todos = getTodos();
    const userTodos = todos.filter(todo => {
        const comment = todo.comment;
        const todoPrefix = "// TODO ";
        const prefixLength = todoPrefix.length;
        if (comment.startsWith(todoPrefix)) {
            const semicolonIndex = comment.indexOf(';', prefixLength);
            if (semicolonIndex !== -1) {
                const extractedUsername = comment.slice(prefixLength, semicolonIndex).trim();
                return extractedUsername.toLowerCase() === username.toLowerCase();
            }
        }
        return false;
    });

    printTodos(userTodos);
}

function getTodos() {
    const todos = [];

    files.forEach(fileContent => {
        const lines = fileContent.split('\n');

        lines.forEach((line, index) => {
            const todoIndex = line.indexOf('// TODO');
            if (todoIndex !== -1) {
                const comment = line.slice(todoIndex).trim(); 
                todos.push({
                    comment: comment,
                    lineNumber: index + 1
                });
            }
        });
    });

    return todos;
}

function printTodos(todos) {
    if (todos.length === 0) {
        console.log('Not found.');
    } else {
        todos.forEach(todo => {
            console.log(`Line ${todo.lineNumber}: ${todo.comment}`);
        });
    }
}

function sortByImportance(todos) {
    return todos.sort((a, b) => {
        const aImportance = (a.comment.includes('!') || []).length;
        const bImportance = (b.comment.includes('!') || []).length;
        return bImportance - aImportance;
    });
}

function sortByUser(todos) {
    const named = [];
    const unnamed = [];

    todos.forEach(todo => {
        const username = extractUsername(todo.comment);
        if (username && !username.toLowerCase().includes("anonymous developer")) {
            named.push(todo);
        } else {
            unnamed.push(todo);
        }
    });

    named.sort((a, b) => {
        const usernameA = extractUsername(a.comment).toLowerCase();
        const usernameB = extractUsername(b.comment).toLowerCase();
        return usernameA.localeCompare(usernameB);
    });

    return named.concat(unnamed);
}

function extractUsername(comment) {
    const todoPrefix = "// TODO ";
    const prefixLength = todoPrefix.length;
    if (comment.startsWith(todoPrefix)) {
        const semicolonIndex = comment.indexOf(';', prefixLength);
        if (semicolonIndex !== -1) {
            return comment.slice(prefixLength, semicolonIndex).trim();
        }
    }
    return null;
}

function sortByDate(todos) {
    return todos.sort((a, b) => {
        const aDate = extractDate(a.comment);
        const bDate = extractDate(b.comment);

        if (!aDate && !bDate) return 0;
        if (!aDate) return 1;
        if (!bDate) return -1;

        return bDate - aDate;
    });
}

function extractDate(comment) {
    const dateRegex = /(\d{4}(-\d{2}(-\d{2})?)?)/;
    const match = comment.match(dateRegex);
    if (match) {
        return new Date(match[0]);
    }
    return null;
}

function filterByDate(todos, dateString) {
    const date = new Date(dateString);
    return todos.filter(todo => {
        const todoDate = extractDate(todo.comment);
        return todoDate && todoDate >= date;
    });
}
