# typing-game

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

# OAuth2.0

```mermaid
sequenceDiagram
	actor リソースオーナ
	participant クライアント
	participant 認可サーバ
	participant リソース


	リソースオーナ->>クライアント: OAuth開始
	クライアント->>リソースオーナ: リダイレクト<br>state
	リソースオーナ->>認可サーバ: 認可リクエスト<br>client_id, state, redirect_uri
	
	Note right of 認可サーバ: 認証処理
	認可サーバ->>リソースオーナ: 認証画面
	リソースオーナ->>認可サーバ: 認証情報

	Note right of 認可サーバ: 認可処理
	認可サーバ->>リソースオーナ: 権限委譲確認画面
	リソースオーナ->>認可サーバ: 権限委譲許可

	Note right of 認可サーバ: 認可レスポンス
	認可サーバ->>リソースオーナ: 認可コード発行<br>code, state, Location(=redirect_uri)
	activate リソースオーナ
	Note left of リソースオーナ: stateの検証
	リソースオーナ->>クライアント: 認可コードリダイレクト
	deactivate リソースオーナ

	Note right of 認可サーバ: トークンリクエスト
	クライアント->>認可サーバ: トークンリクエスト<br>code, client_id, redirect_uri, Authorization
	認可サーバ->>クライアント: トークンレスポンス<br>JSON(access_token)

	Note right of 認可サーバ: リソース要求
	クライアント->>リソース: リソース要求
	リソース->>クライアント: リソース応答
	
```

- client_id: クライアントID
- **state: CSRF対策用の乱数**
- redirect_uri: クライアントへのリダイレクト先、(スキームの部分はクライアント特有の値 ex) myapp://...) 
- **code: 認可コード**
- JWT(JSON Web Token): アクセストークン文字列、期限、Bearerトークンを含む

# OAuth2.0 + PKCE
Proof Key for Code Exchange
罠クライアントが、正当クライアントと同じカスタムスキームを持ち、かつリソースオーナのclient_idを知っている場合に
リソースオーナが罠クライアントを利用してしまい、code(認可コード)の値を罠クライアントが取得する場合。
```mermaid
sequenceDiagram
	actor リソースオーナ
	participant クライアント
	participant ブラウザ
	participant 認可サーバ
	participant リソース


	リソースオーナ->>クライアント: OAuth開始
	クライアント->>ブラウザ: 認可リクエスト<br>code_challenge, code_challenge_method, <br>client_id, state, redirect_uri
	ブラウザ->>認可サーバ: 認可リクエスト<br>code_challenge, code_challenge_method, <br>client_id, state, redirect_uri
	activate 認可サーバ
	Note right of 認可サーバ: チャレンジとメソッドを保存

	
	Note right of 認可サーバ: 認証処理
	認可サーバ->>ブラウザ: 認証画面
	deactivate 認可サーバ
	ブラウザ->>認可サーバ: 認証情報

	Note right of 認可サーバ: 認可処理
	認可サーバ->>ブラウザ: 権限委譲確認画面
	ブラウザ->>認可サーバ: 権限委譲許可

	Note right of 認可サーバ: 認可レスポンス
	認可サーバ->>ブラウザ: 認可コード発行<br>code, state, Location(=redirect_uri)
	activate ブラウザ
	Note left of ブラウザ: stateの検証
	ブラウザ->>クライアント: クライアント起動(認可コード送信)
	deactivate ブラウザ

	Note right of 認可サーバ: トークンリクエスト
	クライアント->>認可サーバ: トークンリクエスト<br>code_verify, <br>code, client_id, redirect_uri, Authorization
	activate 認可サーバ
	Note right of 認可サーバ:  code_verify検証
	認可サーバ->>クライアント: トークンレスポンス<br>JSON(access_token)
	deactivate 認可サーバ
	
	Note right of 認可サーバ: リソース要求
	クライアント->>リソース: リソース要求
	リソース->>クライアント: リソース応答
	
```


code_challenge: チャレンジ
code_challenge: plain(平文)かS256(チャレンジをSHA256でエンコードした値をBase64エンコード)
初めにクライアントがチャレンジとそのメソッド(ハッシュ関数)をブラウザ経由で認可サーバに送信し、認可サーバが保存する。認可サーバはトークンリクエスト時に、クライアントから送信されたcode_verifyがcode_challengeと一致するか検証する。一致すれば正当なクライアント、一致しなければ罠クライアントである。

# OIDC(OpenID Connect)
認可だけではなく、認証が可能。(**OIDC = OAuth2.0 + 認証**)
OAuth2.0ではアクセストークンの発行が
```mermaid
sequenceDiagram
	actor リソースオーナ
	participant クライアント
	participant 認可サーバ
	participant リソース


	リソースオーナ->>クライアント: OAuth開始
	クライアント->>リソースオーナ: リダイレクト
	リソースオーナ->>認可サーバ: 認可リクエスト
	
	Note right of 認可サーバ: 認証処理
	認可サーバ->>リソースオーナ: 認証画面
	リソースオーナ->>認可サーバ: 認証情報

	Note right of 認可サーバ: 認可処理
	認可サーバ->>リソースオーナ: 権限委譲確認画面
	リソースオーナ->>認可サーバ: 権限委譲許可

	Note right of 認可サーバ: 認可レスポンス
	認可サーバ->>リソースオーナ: 認可コード発行
	activate リソースオーナ
	Note left of リソースオーナ: stateの検証
	リソースオーナ->>クライアント: リダイレクト
	deactivate リソースオーナ

	Note right of 認可サーバ: トークンリクエスト
	クライアント->>認可サーバ: トークンリクエスト
	認可サーバ->>クライアント: トークンレスポンス・IDトークン
	activate クライアント
	Note left of クライアント: IDトークンの検証
    
	Note right of 認可サーバ: リソース要求
	クライアント->>リソース: リソース要求
	deactivate クライアント
	リソース->>クライアント: リソース応答
	
```
トークンレスポンス時に、IDトークンを渡す。
IDトークンはJWT(JSON Web Token)形式で以下の値を持つ。
```json
{
  "iss": Issuer(発行者),
  "aud": Audience(クライアントID),
  "sub": Subject(リソースオーナの識別子),
  "iat": Isuued␣At(JWT発行期間),
  "exp": expire(JWT有効期間), 
  "nonce": リプレイ防止用ノンス
}
```

# FIDO(Fast IDentify Online2)
クレデンシャルを送信しない認証
```mermaid
sequenceDiagram
	actor ユーザ
	participant RPサーバ
	participant FIDO2サーバ

	ユーザ->>RPサーバ: optionsを要求
	RPサーバ->>FIDO2サーバ: optionsを要求
	
	activate FIDO2サーバ
	Note right of FIDO2サーバ: challengeの生成とIDとの紐づけ
	
	FIDO2サーバ->>RPサーバ: options応答
	deactivate FIDO2サーバ
	RPサーバ->>ユーザ: options応答
	activate ユーザ
	Note left of ユーザ: 認証器で認証
	Note left of ユーザ: 秘密鍵で署名
	Note left of ユーザ: assertionを生成

	ユーザ->>RPサーバ: assertion
	deactivate ユーザ
	RPサーバ->>FIDO2サーバ: assertion

	activate FIDO2サーバ
	Note right of FIDO2サーバ: challengeからIDを，IDから公開鍵を取得
	Note right of FIDO2サーバ: 公開鍵でassertionを検証
	Note right of FIDO2サーバ: IDに紐づく認証回数を更新
	FIDO2サーバ->>RPサーバ: 結果を応答
	deactivate FIDO2サーバ
	RPサーバ->>ユーザ: cookieやトークン発行
	
	
```
RP(Relaying Party)はFIDOを提供するIDプロバイダを指す．そのためRPサーバとFIDO2サーバはユーザから見たら1つのサーバである．
assertion(≒デジタル署名)を送信するため，クレデンシャルがネットワーク上に流れない．
登録時はユーザが認証器上で鍵ペアを作成後，attestationとして送信し，公開鍵をFIDO2サーバへ送信する．

実際には，スマートフォンの指紋認証やカメラが認証器となり，スマートフォンのWebブラウザからRPアプリケーション(Webアプリケーション)にアクセスし，
RPアプリケーションがRPサーバと通信を行う．そのためWebブラウザとRPアプリケーションの通信はWebAuthnと呼ばれ，認証器とRPサーバとの橋渡しをAPIで行う．
