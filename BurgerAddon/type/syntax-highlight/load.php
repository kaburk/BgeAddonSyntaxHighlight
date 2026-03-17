<?php
$this->BcBaser->css('BgeAddonSyntaxHighlight.bge-addon-syntax-highlight', false);
$this->BcBaser->css('BgeAddonSyntaxHighlight.vendor/highlight-theme.min', false);
$this->BcBaser->js('BgeAddonSyntaxHighlight.vendor/highlight.min', false);
$this->BcBaser->js('BgeAddonSyntaxHighlight.vendor/highlightjs-line-numbers.min', false);

// PHP で CSS URL を直接生成して JS に渡す（ロード順序に依存しない）
// CakePHP のプラグインアセット URL: /plugin_name/css/file.css
$pluginPath = \Cake\Utility\Inflector::underscore('BgeAddonSyntaxHighlight');
$addonCssUrl = $this->BcBaser->getUrl('/' . $pluginPath . '/css/bge-addon-syntax-highlight.css');
$themeCssUrl = $this->BcBaser->getUrl('/' . $pluginPath . '/css/vendor/highlight-theme.min.css');
?>
<script>
(function () {
	// PHP から渡された CSS URL（ロード順序に依存しない）
	var ADDON_CSS_HREFS = [
		<?= json_encode($addonCssUrl) ?>,
		<?= json_encode($themeCssUrl) ?>
	];

	function injectStylesIntoFrameDoc(doc) {
		if (!doc || !doc.head) {
			return;
		}
		ADDON_CSS_HREFS.forEach(function (href) {
			if (!href) {
				return;
			}
			// href の末尾ファイル名で重複チェック（絶対/相対URL の違いを吸収）
			var filename = href.replace(/^.*\//, '');
			if (doc.querySelector('link[href*="' + filename + '"]')) {
				return;
			}
			var link = doc.createElement('link');
			link.rel = 'stylesheet';
			link.href = href;
			doc.head.appendChild(link);
		});
	}

	function tryInjectIntoFrame(frame) {
		var doc;
		try {
			doc = frame.contentWindow && frame.contentWindow.document;
		} catch (e) {
			return;
		}
		if (!doc || !doc.head) {
			return;
		}

		// BurgerEditor の CSS が入っていることを確認してから注入
		var hasBgeStyle = doc.querySelector(
			'link[href*="bge_style_default.css"], link[href*="bge_style.css"], link[href*="burger_editor.css"]'
		);
		if (hasBgeStyle) {
			injectStylesIntoFrameDoc(doc);
		}
	}

	function watchFrame(frame) {
		var doc;
		try {
			doc = frame.contentWindow && frame.contentWindow.document;
		} catch (e) {
			return;
		}

		// iframe の head を監視: BurgerEditor が CSS を追加したら即注入
		var head = (doc && (doc.head || doc.documentElement)) || frame;
		var frameObserver = new MutationObserver(function () {
			try {
				tryInjectIntoFrame(frame);
			} catch (e) {}
		});
		frameObserver.observe(head, { childList: true, subtree: true });

		// 既に CSS が追加済みの場合（MutationObserver コールバックがマイクロタスクのため
		// iframe 追加時には既に BurgerEditor の CSS が注入済みのことがある）
		tryInjectIntoFrame(frame);
	}

	// アウタードキュメントに新しい iframe が追加されたら監視開始
	var outerObserver = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutation) {
			mutation.addedNodes.forEach(function (node) {
				if (node.nodeType !== 1) { return; }
				if (node.tagName === 'IFRAME') {
					watchFrame(node);
				}
				if (node.querySelectorAll) {
					node.querySelectorAll('iframe').forEach(watchFrame);
				}
			});
		});
	});

	outerObserver.observe(document.documentElement, {
		childList: true,
		subtree: true
	});

	// 既存の iframe にも適用
	document.querySelectorAll('iframe').forEach(watchFrame);
})();
</script>
