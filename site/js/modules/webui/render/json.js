import * as Util from '../util/index.js';

function codeBlockJSON(json) {
    return `<pre><code class="code code-block" data-lang="json">${Util.displayJSON(json)}</code></pre>`;
}

export {
    codeBlockJSON,
};
