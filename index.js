import logWatcher from './bin/logWatcher';
import dirWatcher from './bin/dirWatcher';
import restore from './bin/restore';
import consoleIntercept from './bin/consoleIntercept';
import logo from './bin/util/logo';

console.clear();
consoleIntercept();
logo();

logWatcher();
dirWatcher();
restore();