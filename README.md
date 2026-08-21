# StreamShelf_Copilot

A small React Native streaming catalog: horizontal rails on Home, a title detail screen, and a persistent **My List**.

This is a timeboxed take-home (about 4–6 hours). The goal is a runnable app with clear architecture, not a full streaming product.

## Why Expo

Expo (SDK 57, TypeScript blank template) keeps the project runnable with Expo Go on a physical device or simulator without generating `ios/` / `android/` trees. React Native Community CLI would be a better fit if we needed custom native TV modules; for this catalog, Expo is enough and easier for a reviewer to launch.

## Supported targets

| Target | Status |
| --- | --- |
| iOS (Expo Go or simulator) | Primary |
| Android (Expo Go or emulator) | Primary |
| Expo web | Works for keyboard/D-pad style navigation; layout is phone-first |
| Apple TV / Android TV development builds | Supported through the React Native TV fork; focus rings and spatial navigation support remote/D-pad input |

Node: Expo / RN 0.86 prefer Node 20.19+, 22, or 24. This machine had Node 21, which installs with engine warnings. Use Node 22 if you can (`.nvmrc`).

## Setup

```bash
npm install
```

## Run

```bash
npx expo start
```

Then press `i` for iOS, `a` for Android, or `w` for web. Or scan the QR code with Expo Go.

### tvOS development client

The generated tvOS target uses Expo Dev Launcher and must connect to a running Metro server.

```bash
npm run start:tvos
```

Launch the Debug app in the Apple TV simulator. If it stays on **Searching for development servers**, choose **Enter URL manually** and enter the exact URL and port printed by the command above. Keep Metro running while using the app.

### Android TV development build

The Android TV configuration is enabled for the native project while keeping the APK compatible with regular Android devices. Regenerate native files once after changing TV configuration:

```bash
npx expo prebuild --clean
npm run android:tv
```

Use an Android TV emulator or a physical Android TV device. Start Metro separately with `npm run start:tvos`, then launch the installed Debug app. The app does not currently include a dedicated Android TV banner asset, so add one before store submission.

On an ARM64 Android TV device, the APK can be built directly with:

```bash
cd android
ANDROID_HOME="$HOME/Library/Android/sdk" ./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a
```

The default multi-ABI build may fail on machines with an incomplete x86 Android NDK toolchain; that does not affect the ARM64 APK.

The catalog service waits ~700ms and fails about 20% of the time so you can exercise loading, error, and retry. Pull to refresh on Home to request again.

## Test

```bash
npm test
npm run typecheck
```

## What is implemented

- **Home** — three horizontal rails from a local fixture catalog (`Trending`, `New on StreamShelf`, `Staff picks`).
- **Detail** — artwork, description, year/type/rating/runtime, add/remove **My List**.
- **My List** — persisted with AsyncStorage as full title objects, so the shelf still works after a process restart even if the catalog request fails.
- **States** — loading, empty My List, catalog error with retry.
- **Navigation** — bottom tabs (Home / My List) plus native stacks to Detail. Tab buttons and posters are `focusable` and participate in a small spatial navigator (arrow keys on web, TV remote events when the runtime provides them, native focus on Android D-pad).
- **Tests** — catalog success/failure, spatial neighbor selection, storage round-trip and corrupt JSON, Home loading/error/retry, Detail My List toggle, My List hydration after remount.

## Key decisions

1. **Fake network, real asynchrony.** A public API would add keys, rate limits, and flaky CI. `createCatalogService` injects `sleep`, `random`, and `failureRate` so production-like delays exist in the app and tests stay deterministic.
2. **Persist titles, not only IDs.** My List is the one dataset that must survive restart. Storing `Title` JSON avoids a second catalog fetch on launch.
3. **Preview params on Detail.** Rails pass the title they already have so the screen can render immediately; a follow-up `getTitle` call refreshes when the network works.
4. **Directional input as a layer, not a TV fork.** A registry of on-screen controls plus `findNeighbor` is small enough to test without standing up tvOS. It is not a full 10-foot UI.
5. **React Navigation over Expo Router.** Explicit stacks/tabs are easier to reason about for a take-home, and a custom tab bar can be focusable.

## Limitations / next steps

- No video playback, search, profiles, or auth.
- Artwork is from picsum.photos (needs network). Offline posters are not cached.
- Spatial navigation uses `onLayout` / `measureInWindow`; fast scrolling can leave stale coordinates until the next layout.
- Catalog failures are random; there is no in-app “force fail” debug switch.
- Not ejected / no EAS Build config. Store or TV binaries are out of scope.

## How AI was used

Cursor (Grok) scaffolded the Expo app, wrote the feature modules, tests, and this README. I treated that as a first draft: service and storage APIs were designed to be injectable so tests do not depend on timers or `Math.random`; Jest was actually run; typecheck was run. Review the commits and tests rather than assuming generated UI is pixel-perfect.

## License

The Expo template ships with MIT. Application code in this repo follows the same license.
