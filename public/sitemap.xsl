<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output
    method="html"
    version="5.0"
    encoding="UTF-8"
    indent="yes"
    doctype-system="about:legacy-compat" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>API Keychain — Sitemap</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@400;500&amp;display=swap"
          rel="stylesheet" />
        <style>
          *, *::before, *::after { box-sizing: border-box; }

          :root {
            --bg: #050505;
            --fg: #fafafa;
            --muted: #9c9c9c;
            --border: rgba(255, 255, 255, 0.07);
            --border-strong: rgba(255, 255, 255, 0.13);
            --panel-top: rgba(255, 255, 255, 0.045);
            --radius: 16px;
            --font: "Poppins", system-ui, -apple-system, sans-serif;
            --mono: "JetBrains Mono", ui-monospace, monospace;
          }

          html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }

          body {
            margin: 0;
            min-height: 100vh;
            background: var(--bg);
            color: var(--fg);
            font-family: var(--font);
            font-weight: 300;
            letter-spacing: 0.0025em;
            line-height: 1.6;
            position: relative;
            overflow-x: hidden;
          }

          /* Soft radial gradients — ambient, monochrome glow. */
          body::before {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
            background:
              radial-gradient(620px circle at 50% -8%, rgba(255, 255, 255, 0.06), transparent 60%),
              radial-gradient(900px circle at 90% 10%, rgba(255, 255, 255, 0.025), transparent 55%),
              radial-gradient(700px circle at 0% 80%, rgba(255, 255, 255, 0.02), transparent 55%);
            z-index: 0;
          }

          .wrap {
            position: relative;
            z-index: 1;
            max-width: 880px;
            margin: 0 auto;
            padding: clamp(3.5rem, 8vw, 7rem) clamp(1.25rem, 5vw, 2rem) 5rem;
          }

          header { text-align: center; margin-bottom: 3.5rem; }

          .eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            font-family: var(--mono);
            font-size: 0.72rem;
            font-weight: 400;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--muted);
            padding: 0.4rem 0.85rem;
            border: 1px solid var(--border);
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.02);
            margin-bottom: 1.5rem;
          }
          .eyebrow .dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: var(--fg);
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
          }

          h1 {
            font-weight: 600;
            font-size: clamp(2rem, 5.5vw, 3rem);
            letter-spacing: -0.02em;
            margin: 0 0 1rem;
            background: linear-gradient(180deg, #ffffff 0%, #b8b8b8 100%);
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .lede {
            max-width: 34rem;
            margin: 0 auto 2rem;
            color: var(--muted);
            font-size: 1.02rem;
          }

          .count {
            display: inline-flex;
            align-items: baseline;
            gap: 0.5rem;
            font-family: var(--mono);
            font-size: 0.82rem;
            color: var(--muted);
            padding: 0.55rem 1.1rem;
            border: 1px solid var(--border);
            border-radius: 999px;
            background:
              linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.015));
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
          .count strong { color: var(--fg); font-weight: 600; font-size: 1rem; }

          .grid { display: flex; flex-direction: column; gap: 1rem; }

          /* Glassmorphism panel — top-lit hairline, ambient shadow. */
          .card {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1.4rem 1.5rem;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            background:
              linear-gradient(180deg, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.015) 100%);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow:
              inset 0 1px 0 0 var(--panel-top),
              0 1px 2px rgba(0, 0, 0, 0.5),
              0 18px 40px -28px rgba(0, 0, 0, 0.8);
            transition:
              border-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 220ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .card:hover {
            border-color: var(--border-strong);
            transform: translateY(-2px);
            box-shadow:
              inset 0 1px 0 0 rgba(255, 255, 255, 0.06),
              0 1px 2px rgba(0, 0, 0, 0.5),
              0 26px 48px -28px rgba(0, 0, 0, 0.9);
          }

          .card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
          }

          .loc {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            font-family: var(--mono);
            font-size: 0.95rem;
            color: var(--fg);
            text-decoration: none;
            word-break: break-all;
            transition: color 160ms ease;
          }
          .loc:hover { color: #ffffff; }
          .loc .glyph { color: var(--muted); flex: none; }

          .copy {
            flex: none;
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            font-family: var(--mono);
            font-size: 0.72rem;
            letter-spacing: 0.04em;
            color: var(--muted);
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0.4rem 0.7rem;
            cursor: pointer;
            transition: all 180ms cubic-bezier(0.22, 1, 0.36, 1);
          }
          .copy:hover {
            color: var(--fg);
            border-color: var(--border-strong);
            background: rgba(255, 255, 255, 0.07);
          }
          .copy:active { transform: scale(0.96); }
          .copy.copied { color: #fff; border-color: var(--border-strong); }

          .meta {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 0.6rem 1.4rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
          }
          .meta-item {
            display: inline-flex;
            flex-direction: column;
            gap: 0.15rem;
          }
          .meta-label {
            font-family: var(--mono);
            font-size: 0.62rem;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: rgba(255, 255, 255, 0.38);
          }
          .meta-value {
            font-size: 0.85rem;
            color: var(--muted);
            font-weight: 400;
          }

          .priority { margin-left: auto; }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-family: var(--mono);
            font-size: 0.78rem;
            font-weight: 500;
            color: var(--fg);
            padding: 0.35rem 0.7rem;
            border: 1px solid var(--border-strong);
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
          }
          .badge .track {
            position: relative;
            width: 42px; height: 4px;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.1);
            overflow: hidden;
          }
          .badge .fill {
            position: absolute;
            inset: 0;
            border-radius: 999px;
            background: linear-gradient(90deg, #c9c9c9, #ffffff);
          }

          footer {
            margin-top: 4rem;
            text-align: center;
            color: rgba(255, 255, 255, 0.32);
            font-family: var(--mono);
            font-size: 0.72rem;
            letter-spacing: 0.05em;
          }
          footer a { color: var(--muted); text-decoration: none; }
          footer a:hover { color: var(--fg); }

          @media (max-width: 560px) {
            .card-top { align-items: flex-start; }
            .priority { margin-left: 0; }
            .meta { gap: 0.8rem 1rem; }
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <header>
            <span class="eyebrow"><span class="dot"></span>XML Sitemap</span>
            <h1>API Keychain Sitemap</h1>
            <p class="lede">
              A machine-readable index of every public page on API Keychain — one
              API key, multiple AI providers. This view is for humans; search
              engines read the raw XML.
            </p>
            <span class="count">
              <strong><xsl:value-of select="count(s:urlset/s:url)" /></strong>
              <span>indexed URLs</span>
            </span>
          </header>

          <main class="grid">
            <xsl:for-each select="s:urlset/s:url">
              <xsl:sort select="s:priority" order="descending" data-type="number" />
              <article class="card">
                <div class="card-top">
                  <a class="loc" href="{s:loc}" target="_blank" rel="noopener">
                    <span class="glyph">↗</span>
                    <span><xsl:value-of select="s:loc" /></span>
                  </a>
                  <button type="button" class="copy" onclick="copyUrl(this)">
                    <xsl:attribute name="data-url">
                      <xsl:value-of select="s:loc" />
                    </xsl:attribute>
                    <span class="ico">⧉</span>
                    <span class="txt">Copy</span>
                  </button>
                </div>

                <div class="meta">
                  <xsl:if test="s:lastmod">
                    <div class="meta-item">
                      <span class="meta-label">Last Modified</span>
                      <span class="meta-value">
                        <xsl:value-of select="substring(s:lastmod, 1, 10)" />
                      </span>
                    </div>
                  </xsl:if>
                  <xsl:if test="s:changefreq">
                    <div class="meta-item">
                      <span class="meta-label">Change Frequency</span>
                      <span class="meta-value" style="text-transform: capitalize;">
                        <xsl:value-of select="s:changefreq" />
                      </span>
                    </div>
                  </xsl:if>
                  <xsl:if test="s:priority">
                    <div class="meta-item priority">
                      <span class="badge">
                        <span class="track">
                          <span class="fill">
                            <xsl:attribute name="style">
                              <xsl:text>width: </xsl:text>
                              <xsl:value-of select="s:priority * 100" />
                              <xsl:text>%;</xsl:text>
                            </xsl:attribute>
                          </span>
                        </span>
                        <xsl:value-of select="s:priority" />
                      </span>
                    </div>
                  </xsl:if>
                </div>
              </article>
            </xsl:for-each>
          </main>

          <footer>
            <span>Generated by </span>
            <a href="https://apikeychain.dev" target="_blank" rel="noopener">apikeychain.dev</a>
          </footer>
        </div>

        <script>
          <![CDATA[
            function copyUrl(btn) {
              var url = btn.getAttribute('data-url');
              var txt = btn.querySelector('.txt');
              var done = function () {
                btn.classList.add('copied');
                txt.textContent = 'Copied';
                setTimeout(function () {
                  btn.classList.remove('copied');
                  txt.textContent = 'Copy';
                }, 1600);
              };
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(done).catch(function () {
                  fallbackCopy(url, done);
                });
              } else {
                fallbackCopy(url, done);
              }
            }
            function fallbackCopy(text, cb) {
              var ta = document.createElement('textarea');
              ta.value = text;
              ta.style.position = 'fixed';
              ta.style.opacity = '0';
              document.body.appendChild(ta);
              ta.select();
              try { document.execCommand('copy'); } catch (e) {}
              document.body.removeChild(ta);
              cb();
            }
          ]]>
        </script>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
