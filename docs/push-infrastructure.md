# Infraestrutura de push

## Identificadores

- Android: `com.anonymous.barbertche`
- iOS: `com.anonymous.barbertche`
- Canal Android: `appointments`

Os identificadores devem permanecer estáveis depois da primeira publicação. Alterá-los cria outro aplicativo para FCM, APNs e lojas.

## Vincular o projeto ao EAS

```powershell
eas login
eas init
```

O `eas init` adicionará `expo.extra.eas.projectId` ao `app.json`. O frontend também aceita esse valor por `EXPO_PUBLIC_EAS_PROJECT_ID`.

Cadastre `EXPO_PUBLIC_API_BASE_URL` nos ambientes `preview` e `production` do EAS com a URL pública HTTPS do backend.

## Android — FCM V1

1. Criar ou selecionar um projeto no Firebase.
2. Cadastrar um aplicativo Android com package `com.anonymous.barbertche`.
3. Baixar `google-services.json` para a raiz do frontend.
4. Adicionar `"googleServicesFile": "./google-services.json"` em `expo.android` no `app.json`.
5. Gerar uma chave de Service Account com permissão Firebase Messaging API Admin.
6. Executar `eas credentials`, selecionar Android e enviar a chave em `Google Service Account > FCM V1`.

A chave da Service Account é privada e não deve ser commitada. O `google-services.json` contém identificadores públicos e pode ser versionado.

## iOS — APNs

Execute `eas credentials`, selecione iOS e permita que o EAS gere ou reutilize a Push Notification Key da conta Apple Developer.

## Segurança adicional da Expo

Se `Enhanced Security for Push Notifications` for ativada no painel EAS, gere um Expo Access Token e configure `EXPO_ACCESS_TOKEN` somente no ambiente do backend.

## Builds

```powershell
eas build --platform android --profile preview
eas build --platform android --profile production
eas build --platform ios --profile production
```

O perfil `preview` gera APK para teste interno. Produção usa os artefatos padrão das lojas.
