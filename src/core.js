const SimpleSanitizer = (() => {
  const sites = [];
  const config = {};

  function configure(options) {
    for (const [name, value] of Object.entries(options)) {
      config[name] = { ...config[name], ...value };
    }
  }

  function addStyle(css) {
    if (typeof GM_addStyle === "function") {
      GM_addStyle(css);
      return;
    }

    const style = document.createElement("style");
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  // register(test, init) 또는 register(name, test, init).
  // 이름은 config 키 + 에러 라벨용. config가 필요한 사이트만 넘기면 됩니다.
  function register(name, test, init) {
    if (typeof name === "function") {
      init = test;
      test = name;
      name = `site#${sites.length}`;
    }
    sites.push({ name, test, init });
  }

  function run() {
    for (const site of sites) {
      try {
        if (site.test(location)) {
        const options = { ...config["*"], ...config[site.name] };
        site.init({ addStyle, location, document, console, options });
      }
      } catch (err) {
        console.error(`[Simple Sanitizer] ${site.name}`, err);
      }
    }
  }

  function hostIs(hostname, domain) {
    return hostname === domain || hostname.endsWith(`.${domain}`);
  }

  function hostMatches(hostname, regex) {
    return regex.test(hostname);
  }

  return { addStyle, register, configure, run, hostIs, hostMatches };
})();
