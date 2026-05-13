import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const snippet = readFileSync(join(root, "press-news-snippet.html"), "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="IBBN Press &amp; updates — field reports, chapter programmes, and statements from the Initiative for Better and Brighter Nigeria." />
  <title>Press &amp; updates — IBBN Nigeria</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="icon" href="/public/ibbn.png" type="image/png" sizes="any" />
  <link rel="shortcut icon" href="/favicon.ico" type="image/png" />
  <link rel="apple-touch-icon" href="/public/ibbn.png" />
  <link rel="canonical" href="https://ibbnnigeria.org/press.html" />
  <meta name="theme-color" content="#31794c" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="IBBN Nigeria" />
  <meta property="og:title" content="Press &amp; updates — IBBN Nigeria" />
  <meta property="og:description" content="IBBN Press &amp; updates — field reports, chapter programmes, and statements from the Initiative for Better and Brighter Nigeria." />
  <meta property="og:url" content="https://ibbnnigeria.org/press.html" />
  <meta property="og:image" content="https://ibbnnigeria.org/public/ibbn.png" />
  <meta property="og:image:alt" content="IBBN Nigeria logo" />
  <meta property="og:locale" content="en_NG" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@ibbnigeria1" />
  <meta name="twitter:title" content="Press &amp; updates — IBBN Nigeria" />
  <meta name="twitter:description" content="IBBN Press &amp; updates — field reports, chapter programmes, and statements from the Initiative for Better and Brighter Nigeria." />
  <meta name="twitter:image" content="https://ibbnnigeria.org/public/ibbn.png" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="index.html" aria-label="IBBN home">
        <span class="brand-mark">IBBN</span>
        <span class="brand-sub">Better &amp; Brighter Nigeria</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="nav-toggle-bar"></span>
        <span class="sr-only">Menu</span>
      </button>
      <nav id="site-nav" class="site-nav" aria-label="Primary">
        <ul class="nav-list">
          <li><a href="index.html#about">About</a></li>
          <li><a href="index.html#what-we-do">Programmes</a></li>
          <li><a href="leadership.html">Leadership</a></li>
          <li><a href="press.html" aria-current="page">Press</a></li>
          <li><a href="index.html#contact" class="nav-cta">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main id="main">
    <div class="container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">Home</a>
        <span class="breadcrumb-sep" aria-hidden="true">/</span>
        <span class="breadcrumb-current">Press</span>
      </nav>
    </div>

    <section class="section section-alt section-page-head">
      <div class="container narrow">
        <h1 class="page-title">Press &amp; updates</h1>
        <p class="lead">
          Statements, field reports, and photo stories from IBBN chapters across Nigeria. For media enquiries, reach us on WhatsApp.
        </p>
        <p class="page-cta-wrap press-intro-actions">
          <a href="#latest-updates" class="btn btn-ghost">Latest updates</a>
          <a href="https://wa.me/2348181601414?text=Hello%20IBBN%2C%20I%20am%20a%20journalist%20requesting%20a%20statement%20or%20interview." class="btn btn-solid" target="_blank" rel="noopener noreferrer">Media enquiry on WhatsApp</a>
        </p>
      </div>
    </section>

${snippet}
  </main>

  <footer class="site-footer">
    <div class="container">
      <div class="footer-social-bar">
        <p class="footer-heading footer-social-heading">Follow IBBN</p>
        <ul class="social-list">
          <li>
            <a href="https://web.facebook.com/ibbnnigeria" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="IBBN on Facebook">
              <span class="social-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </span>
              <span class="social-label">Facebook</span>
            </a>
          </li>
          <li>
            <a href="https://x.com/ibbnigeria1" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="IBBN on X">
              <span class="social-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </span>
              <span class="social-label">X</span>
            </a>
          </li>
          <li>
            <a href="https://www.instagram.com/isaelbuba/?hl=en" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Isa El-Buba on Instagram">
              <span class="social-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </span>
              <span class="social-label">Instagram</span>
            </a>
          </li>
          <li>
            <a href="https://www.youtube.com/@ProphetIsaElBuba" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Prophet Isa El-Buba on YouTube">
              <span class="social-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </span>
              <span class="social-label">YouTube</span>
            </a>
          </li>
          <li>
            <a href="https://wa.me/2348181601414" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="Contact IBBN on WhatsApp">
              <span class="social-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </span>
              <span class="social-label">WhatsApp</span>
            </a>
          </li>
        </ul>
      </div>
      <div class="footer-grid">
        <div>
          <img class="footer-brand-logo" src="public/ibbn.png" alt="IBBN — Initiative for Better and Brighter Nigeria" width="180" height="54" decoding="async" />
          <p class="footer-tag">Initiative for Better and Brighter Nigeria</p>
        </div>
        <div>
          <p class="footer-heading">Explore</p>
          <ul class="footer-links">
            <li><a href="index.html#about">About</a></li>
            <li><a href="index.html#what-we-do">Programmes</a></li>
            <li><a href="leadership.html">Leadership</a></li>
            <li><a href="press.html">Press</a></li>
            <li><a href="index.html#contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-heading">Site</p>
          <p class="footer-domain">ibbnnigeria.org</p>
          <p class="footer-copy">&copy; <span id="year"></span> IBBN. All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>

  <script src="main.js"></script>
</body>
</html>
`;

writeFileSync(join(root, "press.html"), html, "utf8");
console.log("Wrote press.html");
