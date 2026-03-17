<div class="bge-sh-field">
    <div class="bge-sh-field__row">
        <label for="bge-sh-language">言語</label>
        <select name="bge-sh-language" id="bge-sh-language">
            <option value="auto">自動検出</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="scss">SCSS</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="php">PHP</option>
            <option value="python">Python</option>
            <option value="ruby">Ruby</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="swift">Swift</option>
            <option value="kotlin">Kotlin</option>
            <option value="bash">Bash / Shell</option>
            <option value="powershell">PowerShell</option>
            <option value="sql">SQL</option>
            <option value="json">JSON</option>
            <option value="yaml">YAML</option>
            <option value="xml">XML</option>
            <option value="markdown">Markdown</option>
            <option value="diff">Diff</option>
            <option value="plaintext">プレーンテキスト</option>
        </select>
    </div>

    <div class="bge-sh-field__row">
        <label>
            <input type="checkbox" name="bge-sh-line-numbers" value="bge:checked">
            行番号を表示する
        </label>
    </div>

    <div class="bge-sh-field__row">
        <label for="bge-sh-code">コード</label>
        <textarea name="bge-sh-code" id="bge-sh-code" class="bge-sh-code-input" data-bge="sh-code" rows="12" placeholder="コードを入力してください" spellcheck="false"></textarea>
    </div>

    <div class="bge-sh-field__row">
        <label>プレビュー</label>
        <div class="bge-sh-preview">
            <pre><code></code></pre>
        </div>
    </div>
</div>
