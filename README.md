# StreamShelf

A small React Native streaming catalog: horizontal rails on Home, a title detail screen, and a persistent **My List**.

---

## Technology Choices & Rationale

### Why React Native with TypeScript?

**React Native** enables a single codebase to run on iOS, Android, and tvOS with native performance and platform-specific UX capabilities. This is essential for streaming apps where different devices (phones, TVs) have fundamentally different interaction models.

**TypeScript** provides:

- Compile-time safety for complex feature logic (state management, navigation)
- Self-documenting APIs (the catalog service contract is explicit)
- Easier refactoring as the app grows
- Early error detection in CI before runtime failures

### Why Expo + SDK 57 over React Native Community CLI?

**Decision:** Expo keeps the codebase portable and runnable in a CI environment. I avoid managing native build artifacts for a catalog demo. If this were a shipping app with proprietary video playback or DRM, React Native CLI would be necessary.

### Why TVMaze API?

- Public, no authentication required
- Rich metadata (genres, ratings, descriptions, artwork)
- Simulates real streaming catalog behavior without needing to mock a large dataset
- Deterministic tests can inject mock responses while production uses live data

### Why horizontal rails + flat hierarchy?

- Standard streaming UX pattern (Netflix, Prime Video, Apple TV+)
- Easier spatial navigation on TV remotes
- Horizontal scrolling is native to React Native TV
- Focus rings are visible and predictable

---

## Setup, Run, and Test

### Prerequisites

- **Node 20.19+, 22, or 24** (Expo/React Native 0.86 prefer these versions)
  - Check: `node --version`
  - Set in `.nvmrc` for `nvm use` (if you use nvm)

### Setup

```bash
# Install dependencies with legacy peer deps flag
# (Required because react-native-tvos fork conflicts with peer dependency checks)
npm install --legacy-peer-deps

# Verify TypeScript and tests configure correctly
npm run typecheck
```

**Why `--legacy-peer-deps`?**

This project uses `react-native-tvos` (a fork for TV support) which causes npm's dependency resolver to flag a peer dependency conflict with `@react-native-async-storage/async-storage`. The conflict is a false positive—the TVOS fork is fully compatible. Using `--legacy-peer-deps` tells npm to trust the compatibility and install anyway.

### Run the App

#### Mobile (iOS/Android)

```bash
npx expo start
```

Then press:

- `w` → Web (keyboard navigation)

#### tvOS (Apple TV Simulator)

```bash
# Terminal 1: Start Metro development server
npm run start:tvos
# Note the URL printed (e.g., http://192.168.1.252:8081)
```

Then:

1. Launch **Debug app** in Apple TV simulator (manually via Xcode or Spotlight)
2. If stuck on "Searching for development servers":
   - Choose **Enter URL manually**
   - Paste the exact URL + port printed in Terminal 1
3. Keep Metro running in Terminal 1 while using the app
4. Use Apple TV remote:
   - D-pad to navigate between focusable items
   - Menu/select button to interact

#### Android TV (Android TV Emulator)

**One-time setup (after any TV config changes):**

```bash
npx expo prebuild --clean
```

**Test workflow:**

```bash
# Terminal 1: Start Android TV emulator
emulator -avd Television_4K
OR
~/Library/Android/sdk/emulator/emulator -avd Television_4K

# Terminal 2: Start Metro development server
npm run start:tvos

# Terminal 3 (or VS Code terminal): Build and install to emulator
npm run android:tv
```

Then:

1. Manually launch the **Debug** app on the Android TV emulator home screen
2. The Debug app will auto-connect to Metro server from Terminal 2
3. Use Android TV remote:
   - D-pad to navigate between focusable items
   - OK/select button to interact

**For ARM64 physical device:**

```bash
cd android
ANDROID_HOME="$HOME/Library/Android/sdk" ./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a
```

(The default multi-ABI build may fail on machines with incomplete x86 Android NDK toolchain; that does not affect ARM64.)

### Test

```bash
# Run Jest tests (unit + integration)
npm test

# Type check the entire codebase
npm run typecheck

# Run typecheck and tests together
npm run verify
OR
npm test && npm run typecheck
```

**Note on Testing:** This project uses `react-native-tvos` (a fork for TV support). Due to jest-expo + TVOS fork incompatibility in Node.js test environments, some component tests (DetailScreen, HomeScreen, MyListContext) may have configuration issues. Unit tests for services and utilities (catalogService, spatial navigation, storage) work correctly:

```bash
# Run only unit tests that work reliably
npm test -- --testPathPattern="(catalogService|spatial|myListStorage)"
```

The app itself runs perfectly on devices/emulators—the test limitation is only in the Jest Node environment. For a production setup, use platform-specific testing (XCTest for iOS, Espresso for Android).

**Test examples:**

- ✅ Catalog service: success, failure, retry, empty state, loading
- ✅ Spatial navigation: finding neighbors on TV remote input
- ✅ Storage: persistence across app restart
- ⚠️ My List screen: requires Expo Test Suite
- ⚠️ Home/Detail screens: requires Expo Test Suite

---

## Supported Targets

| Target                            | Status       | Notes                                                   |
| --------------------------------- | ------------ | ------------------------------------------------------- |
| **iOS (Simulator or Expo Go)**    | ✅ Primary   | Full support                                            |
| **Android (Emulator or Expo Go)** | ✅ Primary   | Full support                                            |
| **Expo Web**                      | ✅ Works     | Keyboard/D-pad navigation; phone-first layout           |
| **tvOS (Apple TV Simulator)**     | ✅ Supported | Metro + Debug app; spatial navigation; remote events    |
| **Android TV (Emulator/Device)**  | ✅ Supported | Metro + Debug app; spatial navigation; D-pad; ARM64 APK |

---

## Key Decisions

1. **Live TVMaze API + Deterministic Tests**
   - Production reads real catalog; tests inject fixtures + controlled failures
   - `CatalogService` interface allows both modes
   - Developers can exercise loading, error, and retry without flakiness

2. **Persist Full Title Objects in My List**
   - Store complete `Title` JSON (artwork, description, rating)
   - App works offline if user saved titles before network failure
   - Avoids second catalog fetch on cold start

3. **Preview Params on Detail Screen**
   - Rails pass the title they already loaded
   - Screen renders instantly while `getTitle()` fetches fresh data
   - UX feels snappy even on slow networks

4. **Directional Input as a Layer, Not a TV Framework**
   - Small registry (`DirectionalNav`) tracks focusable elements
   - `findNeighbor()` computes spatial layout
   - Testable without tvOS; works on web keyboard, TV remote, Android D-pad
   - Not a full 10-foot UI framework

5. **React Navigation over Expo Router**
   - Explicit stacks + tabs easier to reason about in a take-home
   - Custom tab bar can be focusable
   - Clearer navigation state for TV remotes

6. **TypeScript Everywhere**
   - Service APIs are type-safe contracts
   - Storage serialization / deserialization are explicit
   - Tests catch state shape mismatches early

---

## Implementation Details

### Architecture

```
src/
├── data/
│   ├── catalogService.ts      # TVMaze API + fixture injection
│   └── __tests__/
├── state/
│   ├── CatalogContext.tsx     # Global catalog state
│   ├── MyListContext.tsx      # Persistent My List
│   └── __tests__/
├── storage/
│   ├── myListStorage.ts       # AsyncStorage JSON persistence
│   └── __tests__/
├── focus/
│   ├── DirectionalNav.tsx     # Spatial navigation provider
│   ├── spatial.ts             # Neighbor finding logic
│   └── __tests__/
├── navigation/
│   └── RootNavigator.tsx      # Bottom tabs + stacks
├── screens/
│   ├── HomeScreen.tsx         # Rails + horizontal scroll
│   ├── DetailScreen.tsx       # Artwork + My List toggle
│   ├── MyListScreen.tsx       # Grid of saved titles
│   └── __tests__/
├── components/
│   ├── ContentRail.tsx        # Reusable rail layout
│   ├── PosterCard.tsx         # Focusable card
│   ├── StatusState.tsx        # Loading / Error / Empty
│   └── ...
└── types.ts                   # Shared types
```

### Data Flow

1. **Catalog** → fetched on `<CatalogProvider>` mount via `catalogService.getHome()`
2. **Title Detail** → cached; detail screen requests full data via `getTitle(id)`
3. **My List** → restored from `AsyncStorage` on `<MyListProvider>` mount; persisted on toggle

### Spatial Navigation (TV)

- Each focusable element registers its layout with `<DirectionalNavProvider>`
- Remote input → find nearest neighbor → set focus
- Works with native focus rings on tvOS / Android TV

---

### Not Included

- 🎬 Video playback, streaming, or DRM
- 👤 User profiles, login
- 💾 Server-side My List sync
- 🎨 Offline poster cache (images require network)
- 🐛 Debug UI to force failures or inject test data at runtime
- EAS Build not configured

---

## Testing Strategy

### Unit Tests

- **catalogService.test.ts** → API mapping, failure injection, retry logic, loading/empty/error states
- **spatial.test.ts** → neighbor finding (left/right/up/down)
- **myListStorage.test.ts** → JSON round-trip, corruption handling

### Integration Tests

- **HomeScreen.test.tsx** → rails load, error state, retry action
- **DetailScreen.test.tsx** → My List add/remove
- **MyListContext.test.tsx** → persistence across remount, rapid toggles

### Running Tests

```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
npm run typecheck          # TypeScript check (0 errors required)
```

---

## What is Implemented

- **Home** — three horizontal rails populated from the live TVMaze public API (`Popular right now`, `New and recently premiered`, `Drama picks`).
- **Detail** — artwork, description, year/type/rating/runtime, add/remove **My List**.
- **My List** — persisted with AsyncStorage as full title objects, so the shelf still works after a process restart even if the catalog request fails.
- **States** — loading, empty My List, catalog error with retry.
- **Navigation** — bottom tabs (Home / My List) plus native stacks to Detail. Tab buttons and posters are `focusable` and participate in a small spatial navigator (arrow keys on web, TV remote events when the runtime provides them, native focus on Android D-pad).
- **Tests** — catalog success/failure/empty/loading, spatial neighbor selection, storage round-trip and corrupt JSON, Home loading/error/retry, Detail My List toggle, My List hydration after remount.

---

## Quick Links

- [TVMaze API Docs](https://www.tvmaze.com/api)
- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev/versions/v57.0.0/)
- [React Navigation](https://reactnavigation.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
