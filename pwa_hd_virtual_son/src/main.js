class init {
    constructor() {
        let component = require('./template');
        let app = document.getElementById('app');
        app.innerHTML = component.template;
        component.action();
    }
}

new init();