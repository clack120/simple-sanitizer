# Simple Sanitizer

방송이나 화면 공유할 때 네이버쇼핑, 알리같은 사이트에 뜨는 이름이나 주소를 CSS로 가려주는 작은 userscript입니다.

사이트 구조가 바뀌거나, 렌더링이 늦거나, shadow DOM 같은 게 끼면 민감한 정보가 그대로 보일 수 있으니 부디 보조용 가림막 정도로만 써주세요.

버그 제보, 사이트 추가 PR, 이슈 제보 모두 환영합니다.

## 설치

userscript로 쓰는 게 제일 편합니다.

1. Violentmonkey 또는 크로미움 계열은 [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)를 설치합니다.
2. [Releases](../../releases)에서 `simple-sanitizer.user.js`를 엽니다.
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
