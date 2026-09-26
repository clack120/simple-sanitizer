Suggestions for new sites are welcome in Issues.
# Simple Sanitizer

방송이나 화면 공유할 때 네이버쇼핑, 알리같은 사이트에 뜨는 이름이나 주소를 CSS로 가려주는 작은 userscript입니다.  

사이트 구조가 바뀌거나, 렌더링이 늦거나, shadow DOM 같은 게 끼면 민감한 정보가 그대로 보일 수 있으니 부디 보조용 가림막 정도로만 써주세요.
버그 제보, 사이트 추가 PR, 이슈 제보 모두 환영합니다.

## 알파 릴리즈 주의

GitHub Releases에 올라오는 버전은 아직 **알파(Alpha) 릴리즈**입니다.  
예고 없이 동작이 바뀌거나 문제가 생길 수 있으므로 중요한 환경에서는 사용하지 말고, 실제 사용 전 반드시 동작을 직접 확인해 주세요.

## 설치

Safari에서는 [Userscripts](https://apps.apple.com/app/userscripts/id1463298887) 확장 프로그램을 사용하세요.

1. Violentmonkey 또는 크로미움 계열은 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)를 설치합니다.
2. [`simple-sanitizer.user.js`](https://github.com/clack120/simple-sanitizer/releases/download/latest-alpha/simple-sanitizer.user.js)를 엽니다.
3. 설치하면 끝입니다.

## 개발

`src/sites/`에 파일을 하나 추가하면 빌드할 때 자동으로 번들됩니다.

```js
SimpleSanitizer.register(
  ({ hostname }) => SimpleSanitizer.hostIs(hostname, "example.com"),
  ({ addStyle }) => addStyle(`.sensitive { display: none !important; }`),
);
```

dev/run-all.mjs를 실행하고 `dev/dev-loader.user.js`를 설치해두면 저장할 때마다 변경 사항이 반영됩니다.

```js
SimpleSanitizer.register("example", test, ({ addStyle, options }) => {
  if (options.hideName) addStyle(`...`);
});
```

```js
SimpleSanitizer.configure({
  example: {
    hideName: true,
  },
});
```
